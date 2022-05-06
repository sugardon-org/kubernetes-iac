# kubernetes iac

https://www.pulumi.com/docs/get-started/kubernetes/

# Run

## local

1. setup local kind cluster

```console
$ kind create cluster --config=./kind-config.yaml
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

```console
$ kubectl config use-context ${SUGARDON01_CONTEXT}

$ yarn
$ export PULUMI_CONFIG_PASSPHRASE=${PASSPHRASE}
$ export ENVIRONMENT=sugardon01
$ pulumi login
$ pulumi stack select $ENVIRONMENT
# check Pulumi.sugardon01.yaml before execute
$ pulumi up  --stack=$ENVIRONMENT
# If different from target cluster
# $ pulumi up --refresh
```
