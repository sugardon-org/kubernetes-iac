import * as pulumi from "@pulumi/pulumi";
import { Metallb } from "./src/metallb";
import { IngressNginx } from "./src/ingressNginx";

const config = new pulumi.Config();
export const env = config.require("environment");
pulumi.log.info("environment : " + env);

const metallb = new Metallb("metallb", {
  environment: env,
  kustomizePath: "./kustomize/metallb/overlays/" + env,
});
export const kustomizeUrn = metallb.kustomizeUrn;

const ingressNginx = new IngressNginx("IngressNginx", {
  environment: env,
  namespace: "ingress-nginx",
});
export const ingressNginxHelmUrn = ingressNginx.helmUrn;
