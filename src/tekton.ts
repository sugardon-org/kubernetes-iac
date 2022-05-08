import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface tektonProps {
  environment: string;
  kustomizePath: string;
}

interface DefaultProps {
  namespace: string;
}
const dp: DefaultProps = {
  namespace: "tekton-cicd",
};

export class Tekton extends pulumi.ComponentResource {
  readonly operatorUrn: pulumi.Output<string>;
  readonly tektonConfigUrn: pulumi.Output<string>;
  readonly tektonChainUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: tektonProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:kustomize:tekton", name, {}, opts);

    const operator = new k8s.yaml.ConfigFile(
      "operator",
      {
        file: "https://storage.googleapis.com/tekton-releases/operator/previous/v0.52.0/release.yaml",
      },
      {
        parent: this,
      }
    );
    this.operatorUrn = operator.urn;
    // TODO: Update dependsOn
    // https://github.com/pulumi/pulumi-kubernetes/issues/1833
    const operatorCrd = operator.getResource(
      "apiextensions.k8s.io/v1/CustomResourceDefinition",
      "tektonconfigs.operator.tekton.dev"
    );

    // https://github.com/tektoncd/operator/blob/main/docs/TektonConfig.md
    const tektonConfig = new k8s.apiextensions.CustomResource(
      "config",
      {
        apiVersion: "operator.tekton.dev/v1alpha1",
        kind: "TektonConfig",
        metadata: {
          name: "config",
          namespace: dp.namespace,
        },
        spec: {
          profile: "all",
          targetNamespace: dp.namespace,
        },
      },
      {
        parent: this,
        dependsOn: operatorCrd,
        deleteBeforeReplace: true,
      }
    );
    this.tektonConfigUrn = tektonConfig.urn;

    // TODO: Migrate kustomize to pulumi code
    const config = new k8s.kustomize.Directory(
      props.kustomizePath,
      {
        directory: props.kustomizePath,
      },
      {
        parent: this,
        dependsOn: operator.ready,
      }
    );
    this.tektonChainUrn = config.urn;

    this.registerOutputs();
  }
}
