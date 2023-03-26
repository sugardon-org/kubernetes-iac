import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { Emissary } from "./src/emissary";
import { Metallb } from "./src/metallb";
import { IngressNginx } from "./src/ingressNginx";
import { CertManager } from "./src/certManager";
import { NfsServer } from "./src/nfsServer";
import { CsiDriverNfs } from "./src/csiDriverNfs";

const config = new pulumi.Config();
export const env = config.require("environment");
pulumi.log.info("environment : " + env);

interface RootConfig {
  // TODO: Remove disableTekton
  disableTekton: boolean | undefined; // Remove
}
const rootConfig: RootConfig = {
  disableTekton: false,
};

const rcd: RootConfig | undefined = config.getObject<RootConfig>("root-config");
if (rcd) {
  (Object.keys(rcd) as (keyof RootConfig)[]).forEach((key) => {
    if (rcd[key] !== undefined) {
      rootConfig[key] = rcd[key];
    }
  });
}

const provider = new kubernetes.Provider("kubernetes", {
  context: "kubernetes-admin-cluster.local@cluster.local",
  enableServerSideApply: true,
}, undefined);

const metallb = new Metallb("metallb", {
  environment: env,
  kustomizePath: "./kustomize/metallb/overlays/" + env,
});
export const metallbKustomizeUrn = metallb.kustomizeUrn;

// Ingress
const ingressNginx = new IngressNginx(
  "IngressNginx",
  {
    environment: env,
    namespace: "ingress-nginx",
  },
  { provider: provider }
);
export const ingressNginxHelmUrn = ingressNginx.helmUrn;
const emissary = new Emissary(
  "Emissary",
  {
    environment: env,
  },
  { provider: provider }
);
export const emissaryHelmUrn = emissary.helmUrn;

export const applyCenterManager = config.getBoolean("applyCertManager");
export let certManagerHelmUrn = pulumi.output("Not Apply CertManager");
if (applyCenterManager) {
  const certManager = new CertManager(
    "CertManager",
    {
      environment: env,
      namespace: "cert-manager",
    },
    { provider: provider }
  );
  certManagerHelmUrn = certManager.helmUrn;
}

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
  const nfsServer = new NfsServer(
    "NfsServer",
    {
      environment: env,
      kustomizePath: "./kustomize/nfs-server/overlays/" + env,
    },
    { provider: provider }
  );
  csiServerKustomizeUrn = nfsServer.kustomizeUrn;
}

const csiDriverNfs = new CsiDriverNfs(
  "CSI Driver NFS",
  {
    environment: env,
  },
  { provider: provider }
);
export const csiDriverNfsHelmUrn = csiDriverNfs.helmUrn;
