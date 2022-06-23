import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface emissaryProps {
  environment: string;
}

export class Emissary extends pulumi.ComponentResource {
  public helmUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: emissaryProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:helm:emissary", name, {}, opts);
    const options = { parent: this };

    const namespace = "emissary"
    const crds = new k8s.yaml.ConfigFile(
      "crds",
      {
        file: "https://app.getambassador.io/yaml/emissary/2.2.2/emissary-crds.yaml",
      },
      options
    );

    const emissaryChart = new k8s.helm.v3.Release(
      "emissary-ingress",
      {
        chart: "emissary-ingress",
        version: "7.4.1",
        namespace: namespace,
        createNamespace: true,
        repositoryOpts: {
          repo: "https://app.getambassador.io",
        },
        values: {
          replicaCount: 1,
          ingressClassResource: {
            enabled: true,
            name: "emissary",
          },
        },
      },
      {
        dependsOn: crds,
        ...options,
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars 
    const listener = new k8s.yaml.ConfigFile(
      "listner",
      {
        file: path.join(__dirname, "listener.yaml"),
        transformations: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
          (obj: any, opts: pulumi.CustomResourceOptions) => {
            if (obj.kind === "Listener") {
              obj.namespace = namespace;
            }
          },
        ],
      },
      {
        dependsOn: emissaryChart,
        ...options,
      }
    );

    this.helmUrn = emissaryChart.urn;
    this.registerOutputs();
  }
}
