import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface nfsServerProps {
  environment: string;
  kustomizePath: string;
}

export class NfsServer extends pulumi.ComponentResource {
  public kustomizeUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: nfsServerProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:kustomize:nfsServer", name, {}, opts);

    const dir = new k8s.kustomize.Directory(props.kustomizePath, {
      directory: props.kustomizePath,
    });

    this.kustomizeUrn = dir.urn;
    this.registerOutputs();
  }
}
