import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface tektonProps {
  environment: string;
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
        file: "https://storage.googleapis.com/tekton-releases/operator/previous/v0.55.1/release.yaml",
      },
      {
        parent: this,
      }
    );
    this.operatorUrn = operator.urn;
    // TODO: Update dependsOn
    // https://github.com/pulumi/pulumi-kubernetes/issues/1833
    const tektonConfigCrd = operator.getResource(
      "apiextensions.k8s.io/v1/CustomResourceDefinition",
      "tektonconfigs.operator.tekton.dev"
    );
    // TODO: Update dependsOn
    // https://github.com/pulumi/pulumi-kubernetes/issues/1833
    const tektonChainCrd = operator.getResource(
      "apiextensions.k8s.io/v1/CustomResourceDefinition",
      "tektonchains.operator.tekton.dev"
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
        dependsOn: tektonConfigCrd,
        deleteBeforeReplace: true,
      }
    );
    this.tektonConfigUrn = tektonConfig.urn;

    // https://github.com/tektoncd/operator/blob/main/docs/TektonChain.md
    const tektonChain = new k8s.apiextensions.CustomResource(
      "chain",
      {
        apiVersion: "operator.tekton.dev/v1alpha1",
        kind: "TektonChain",
        metadata: {
          name: "chain",
          namespace: dp.namespace,
        },
        spec: {
          targetNamespace: dp.namespace,
        },
      },
      {
        parent: this,
        dependsOn: tektonChainCrd,
        deleteBeforeReplace: true,
      }
    );
    this.tektonChainUrn = tektonChain.urn;

    this.registerOutputs();
  }
}
