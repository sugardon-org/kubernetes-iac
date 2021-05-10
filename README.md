# kubernetes iac

https://www.pulumi.com/docs/get-started/kubernetes/

# Run

## local

```bash
$ yarn
$ ENVIRONMENT=local
$ pulumi config set environment $ENVIRONMENT
$ pulumi up
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
