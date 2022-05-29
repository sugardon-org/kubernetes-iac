import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface ambassadorProps {
  environment: string;
}

export class Ambassador extends pulumi.ComponentResource {
  readonly operatorUrn: pulumi.Output<string>;
  readonly ambassadorInstallationUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: ambassadorProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes.operator.ambassador", name, {}, opts);

    // https://www.getambassador.io/docs/emissary/2.0/topics/install/operator/
    const crds = new k8s.yaml.ConfigFile(
      "crds",
      {
        // https://github.com/datawire/ambassador-operator/releases/tag/v1.3.0
        file: "https://github.com/datawire/ambassador-operator/releases/download/v1.3.0/ambassador-operator-crds.yaml",
      },
      {
        parent: this,
      }
    );
    const ambassadorInstallationCrd = crds.getResource(
      "apiextensions.k8s.io/v1/CustomResourceDefinition",
      "ambassadorinstallations.getambassador.io"
    );

    const operatorNamespace = new k8s.core.v1.Namespace(
      "emissary",
      {
        metadata: {name: "emissary"}
      },
      {
        parent: this
      }
    )
    const ambassadorOperator = new k8s.helm.v3.Chart(
      "ambassador-operator",
      {
        chart: "ambassador-operator",
        version: "0.3.0",
        namespace: operatorNamespace.metadata.name,
        fetchOpts: {
          repo: "https://getambassador.io",
        },
      },
      {
        parent: this,
        dependsOn: ambassadorInstallationCrd,
      }
    );
    this.operatorUrn = ambassadorOperator.urn;

    const ambassadorInstallation = new k8s.apiextensions.CustomResource(
      "ambassadorInstallation",
      {
        apiVersion: "getambassador.io/v2",
        kind: "AmbassadorInstallation",
        metadata: {
          name: "config",
          namespace: operatorNamespace.metadata.name,
        },
        spec: {
          version: "2.*-ea",
          installOSS: true,
        },
      },
      {
        parent: this,
        dependsOn: ambassadorOperator.ready,
      }
    );
    this.ambassadorInstallationUrn = ambassadorInstallation.urn;

    this.registerOutputs();
  }
}
