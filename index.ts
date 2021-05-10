import * as pulumi from "@pulumi/pulumi";
import { Metallb } from "./src/metallb";

const config = new pulumi.Config();
const env = config.require("environment");
pulumi.log.info("environment : " + env);

const metallb = new Metallb("metallb", {
  environment: env,
  kustomizePath: "./kustomize/metallb/overlays/" + env,
});
export const kustomizeUrn = metallb.kustomizeUrn;
