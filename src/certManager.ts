import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface certManagerProps {
  environment: string;
  namespace?: string;
}

export class CertManager extends pulumi.ComponentResource {
  public helmUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: certManagerProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:helm:certManager", name, {}, opts);

    // https://cert-manager.io/docs/installation/kubernetes/#option-2-install-crds-as-part-of-the-helm-release
    // https://docs.microsoft.com/ja-jp/azure/aks/ingress-tls#install-cert-manager
    const n = props.namespace || "cert-manager";
    const namespace = new k8s.core.v1.Namespace(
      n,
      {
        metadata: { name: n },
      },
      opts
    );

    // TODO: consider about pulumi dependencies

    const helm = new k8s.helm.v3.Chart("cert-manager", {
      chart: "cert-manager",
      version: "1.3.1",
      namespace: namespace.metadata.name,
      fetchOpts: {
        repo: "https://charts.jetstack.io",
      },
      values: {
        // https://github.com/jetstack/cert-manager/blob/master/deploy/charts/cert-manager/values.yaml
        installCRDs: true,
      },
    });

    this.helmUrn = helm.urn;
    this.registerOutputs();
  }
}
