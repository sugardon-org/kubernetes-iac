import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface metallbProps {
    environment: string
    kustomizePath: string
}

export class Metallb extends pulumi.ComponentResource {
    public kustomizeUrn: pulumi.Output<string>;

    constructor(name: string, props: metallbProps, opts?: pulumi.ComponentResourceOptions) {
        super("kubernetes:kustomize:metallb", name, {}, opts);

        // TODO: improve local kind network
        // ref. https://kind.sigs.k8s.io/docs/user/loadbalancer/

        const dir = new k8s.kustomize.Directory(props.kustomizePath, {
            directory: props.kustomizePath
        })

        this.kustomizeUrn = dir.urn
        this.registerOutputs()
    }
}
