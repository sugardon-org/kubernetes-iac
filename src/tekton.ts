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
  public kustomizeUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: tektonProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:kustomize:tekton", name, {}, opts);

    const operator = new k8s.yaml.ConfigFile("operator", {
      file: "https://storage.googleapis.com/tekton-releases/operator/previous/v0.57.0/release.yaml",
    }, {
      parent: this,
    });

    const operatorCrd = operator.getResource("apiextensions.k8s.io/v1/CustomResourceDefinition", "tektonconfigs.operator.tekton.dev")

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

    this.kustomizeUrn = config.urn;
    this.registerOutputs();
  }
}
