# kubernetes iac

https://www.pulumi.com/docs/get-started/kubernetes/

# Run

## local

1. setup local kubernetes cluster

```console
# kind
$ kind create cluster --config=./kind-config.yaml --image=kindest/node:v1.21.2
# minikube
$ minikube start --kubernetes-version=v1.21.2
```

1. pulumi

```console
$ yarn
$ pulumi login --local
$ export PULUMI_CONFIG_PASSPHRASE=password
$ export ENVIRONMENT=local
$ pulumi up --stack=$ENVIRONMENT --config-file=./Pulumi.local.yaml
```

## sugardon01

### Enable Server Side Apply

<https://www.pulumi.com/registry/packages/kubernetes/how-to-guides/managing-resources-with-server-side-apply/#managing-resources-with-server-side-apply>

```
export PULUMI_K8S_ENABLE_PATCH_FORCE="true"
```

### Run

```bash
kubectl config use-context ${SUGARDON01_CONTEXT}

yarn
export PULUMI_CONFIG_PASSPHRASE=${PASSPHRASE}
export ENVIRONMENT=sugardon01
pulumi login
pulumi stack select $ENVIRONMENT

# check Pulumi.sugardon01.yaml before execute
pulumi up --stack=$ENVIRONMENT

# If different from target cluster
# $ pulumi up --refresh
```
