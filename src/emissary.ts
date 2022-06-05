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

    const namespace = new k8s.core.v1.Namespace(
      "emissary",
      {
        metadata: { name: "emissary" },
      },
      options
    );

    const crds = new k8s.yaml.ConfigFile(
      "crds",
      {
        file: "https://app.getambassador.io/yaml/emissary/2.2.2/emissary-crds.yaml",
      },
      options
    );

    const emissaryChart = new k8s.helm.v3.Chart(
      "emissary-ingress",
      {
        chart: "emissary-ingress",
        version: "7.3.2",
        namespace: namespace.metadata.name,
        fetchOpts: {
          repo: "https://app.getambassador.io",
        },
        values: {
          replicaCount: 1,
        },
      },
      {
        dependsOn: crds,
        ...options,
      }
    );

    this.helmUrn = emissaryChart.urn;
    this.registerOutputs();
  }
}
