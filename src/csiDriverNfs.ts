import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface csiDriverNfsProps {
  environment: string;
  // use kube-system
  // namespace?: string;
}

export class CsiDriverNfs extends pulumi.ComponentResource {
  public helmUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: csiDriverNfsProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:helm:csiDriverNfs", name, {}, opts);

    // https://github.com/kubernetes-csi/csi-driver-nfs/tree/master/charts
    const cdn = new k8s.helm.v3.Release("csi-driver-nfs", {
      chart: "csi-driver-nfs",
      version: "3.0.0",
      namespace: "kube-system",
      repositoryOpts: {
        repo: "https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/master/charts",
      },
      values: {
        controller: {
          // For single node,
          // https://github.com/kubernetes-csi/csi-driver-nfs/pull/174#issuecomment-798308724
          replicas: 1,
        },
      },
    });

    this.helmUrn = cdn.urn;
    this.registerOutputs();
  }
}
