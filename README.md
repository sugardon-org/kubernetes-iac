# kubernetes iac

https://www.pulumi.com/docs/get-started/kubernetes/

# Run

## local

1. setup local kind cluster

```bash
$ kind create cluster --config=./kind-config.yaml
```

1. pulumi

```bash
$ yarn
$ export PULUMI_CONFIG_PASSPHRASE=password
$ ENVIRONMENT=local
$ pulumi up --config-file=./local-config.yaml
```

## sugardon01

```bash
$ kubectl config use-context ${SUGARDON01_CONTEXT}

$ yarn
$ ENVIRONMENT=sugardon01
$ pulumi login
$ pulumi stack select $ENVIRONMENT
$ pulumi config set environment $ENVIRONMENT
$ pulumi up
```
