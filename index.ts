import * as pulumi from "@pulumi/pulumi";
import { Metallb } from "./src/metallb";
import { IngressNginx } from "./src/ingressNginx";
import { NfsServer } from "./src/nfsServer";
import { CsiDriverNfs } from "./src/csiDriverNfs";
import { Tekton } from "./src/tekton";

const config = new pulumi.Config();
export const env = config.require("environment");
pulumi.log.info("environment : " + env);

const metallb = new Metallb("metallb", {
  environment: env,
  kustomizePath: "./kustomize/metallb/overlays/" + env,
});
export const metallbKustomizeUrn = metallb.kustomizeUrn;

const ingressNginx = new IngressNginx("IngressNginx", {
  environment: env,
  namespace: "ingress-nginx",
});
export const ingressNginxHelmUrn = ingressNginx.helmUrn;

// CSI
interface CsiData {
  applyNfsServer?: boolean;
}
// structured configuration
// https://www.pulumi.com/docs/intro/concepts/config/#structured-configuration
const csidata = config.requireObject<CsiData>("csi-data");

export let csiServerKustomizeUrn: pulumi.Output<string> = pulumi.output(
  "Not Apply NFS Server"
);
if (csidata.applyNfsServer) {
  const nfsServer = new NfsServer("NfsServer", {
    environment: env,
    kustomizePath: "./kustomize/nfs-server/overlays/" + env,
  });
  csiServerKustomizeUrn = nfsServer.kustomizeUrn;
}

const csiDriverNfs = new CsiDriverNfs("CSI Driver NFS", {
  environment: env,
});
export const csiDriverNfsHelmUrn = csiDriverNfs.helmUrn;

const tekton = new Tekton("Tekton", {
  environment: env,
  kustomizePath: "./kustomize/tekton/overlays/" + env,
});
export const tektonKustomizeUrn = tekton.kustomizeUrn;
