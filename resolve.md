# Team Alpha - Resolve.md

## System Overview
We manage the payments-api and checkout-microservices running on Kubernetes.

## Terminology
- **Gateway:** Kong API gateway routing external traffic to internal pods.
- **Critical Error:** Any 5xx spike lasting longer than 2 minutes.

## Observability Guidance
- When checking logs, always filter by `namespace=production` and `service_name=payments`.