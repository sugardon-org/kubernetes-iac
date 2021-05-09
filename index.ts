import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes";
import { Metallb } from "./src/metallb";

let config = new pulumi.Config();
let env = config.require("environment");
pulumi.log.info("environment : " + env)

const metallb = new Metallb("metallb", {
    environment: env,
    kustomizePath: "./kustomize/metallb/overlays/" + env
})
export const kustomizeUrn = metallb.kustomizeUrn;
