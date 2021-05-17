import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface tektonProps {
  environment: string;
  kustomizePath: string;
}

export class Tekton extends pulumi.ComponentResource {
  public kustomizeUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: tektonProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:kustomize:tekton", name, {}, opts);

    const dir = new k8s.kustomize.Directory(props.kustomizePath, {
      directory: props.kustomizePath,
    });

    this.kustomizeUrn = dir.urn;
    this.registerOutputs();
  }
}
