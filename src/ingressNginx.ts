import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

interface ingressNginxProps {
  environment: string;
  namespace?: string;
  deployDefaultService?: boolean;
}

export class IngressNginx extends pulumi.ComponentResource {
  public helmUrn: pulumi.Output<string>;

  constructor(
    name: string,
    props: ingressNginxProps,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("kubernetes:helm:ingressNginx", name, {}, opts);

    const n = props.namespace || "ingress-nginx";
    const ingressNamaspace = new k8s.core.v1.Namespace(
      n,
      {
        metadata: { name: n },
      },
      opts
    );
    // TODO: consider about namespace ResourceQuota and LimitRange
    // https://www.pulumi.com/docs/guides/crosswalk/kubernetes/configure-defaults/#quotas

    // TODO: consider about pulumi dependencies

    const ingressNginx = new k8s.helm.v3.Chart("nginx-ingress", {
      chart: "ingress-nginx",
      version: "3.30.0",
      namespace: ingressNamaspace.metadata.name,
      fetchOpts: {
        repo: "https://kubernetes.github.io/ingress-nginx/",
      },
      values: {
        // https://github.com/kubernetes/ingress-nginx/blob/master/charts/ingress-nginx/values.yaml
        controller: {
          // TODO: Use Ingress Class cf. https://kubernetes.io/ja/docs/concepts/services-networking/ingress/#ingress-class
          // issue: https://github.com/kubernetes/ingress-nginx/pull/6882
          ingressClass: "nginx",
          metrics: {
            enabled: true,
          },
          extraArgs: {
            "enable-ssl-passthrough": true,
          },
          // https://github.com/kubernetes/ingress-nginx/blob/0396b888f6161419a070e2573c4a7f188e9109be/charts/ingress-nginx/values.yaml#L361
          service: {
            enabled: true,
            annotations: {
              // https://github.com/sugardon-org/kubernetes-iac/blob/f3a35e20a7789ee1e2ae6e41906e73183e82c63a/kustomize/metallb/overlays/local/config.yaml#L3
              "metallb.universe.tf/address-pool": "default",
              "ingressclass.kubernetes.io/is-default-class": true,
            },
          },
        },
      },
    });

    this.helmUrn = ingressNginx.urn;
    this.registerOutputs();
  }
}
