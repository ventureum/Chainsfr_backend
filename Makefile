SHELL := /bin/bash
STACK_NAME_PREFIX=chainsfer-backend-stack
ENV=dev
REGION=us-east-1

.PHONY: all init package deploy delete output clean

all: init package deploy clean

init:
	@aws s3api create-bucket \
		--bucket $(STACK_NAME_PREFIX)-$(ENV) \
		--region us-east-1 

package:
	@aws cloudformation package \
		--template-file template.yaml \
		--s3-bucket $(STACK_NAME_PREFIX)-$(ENV) \
		--output-template-file template_packaged_$(ENV).yml \
		--region ${REGION} 
deploy:
	@aws cloudformation deploy \
		--template-file ./template_packaged_$(ENV).yml \
		--stack-name $(STACK_NAME_PREFIX)-$(ENV) \
		--parameter-overrides \
			EnvLowercase=$(shell ENV_LOWERCASE=$(ENV); echo $${ENV_LOWERCASE,,})  \
			ENV=$(shell ENV=$(ENV); echo $${ENV^}) \
			EthPrivateKey=$(shell EthPrivateKey=$(ETH_PRIVATE_KEY); echo $${EthPrivateKey^}) \
			BtcWif=$(shell BtcWif=$(BTC_WIF); echo $${BtcWif^}) \
		--capabilities CAPABILITY_IAM \
		--region ${REGION}
	@$(MAKE) output

delete:
	@aws cloudformation delete-stack \
		--stack-name $(STACK_NAME_PREFIX)-$(ENV) \
		--region ${REGION}

output:
	@aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME_PREFIX)-$(ENV) \
		--region ${REGION} \
		--query 'Stacks[].Outputs' \
		--output table
clean:
	rm -f ./template_packaged*.yml
