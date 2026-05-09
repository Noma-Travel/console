📦 Creating DynamoDB tables...
🔄 Using AWS Profile: maker in region us-east-1
🛠️  Creating table: productora_blueprints...
⏳ Waiting for table 'productora_blueprints' to become active...
✅ Table 'productora_blueprints' is now active.
🛠️  Creating table: productora_entities...
⏳ Waiting for table 'productora_entities' to become active...
✅ Table 'productora_entities' is now active.
🛠️  Creating table: productora_rel...
⏳ Waiting for table 'productora_rel' to become active...
✅ Table 'productora_rel' is now active.
🛠️  Creating table: productora_chat...
⏳ Waiting for table 'productora_chat' to become active...
✅ Table 'productora_chat' is now active.
🛠️  Creating table: productora_data...
⏳ Waiting for table 'productora_data' to become active...
✅ Table 'productora_data' is now active.

👥 Creating Cognito User Pool...
🛠️ Creating Cognito User Pool for environment: productora...
✅ User Pool Created! ID: us-east-1_upbl7rMKZ
🔗 ARN: arn:aws:cognito-idp:us-east-1:339713094352:userpool/us-east-1_upbl7rMKZ
🛠️ Creating App Client for User Pool us-east-1_upbl7rMKZ...
✅ App Client Created! ID: 4l6t4s7qfg4mgm2ufdk63k086e

🔒 Creating IAM Policy...
✅ IAM Policy Created Successfully!
🔹 Policy Name: productora_tt_policy
🔹 Policy ARN: arn:aws:iam::339713094352:policy/productora_tt_policy

👔 Creating IAM Role...
🛠️ Creating IAM Role: productora_tt_role...
✅ IAM Role Created Successfully! ARN: arn:aws:iam::339713094352:role/productora_tt_role
🔗 Attaching Policy: arn:aws:iam::339713094352:policy/productora_tt_policy to Role: productora_tt_role...
✅ Policy attached successfully!

Adding default blueprints to DB...
🔄 Using AWS Profile: maker in region us-east-1
📂 Loading blueprint files...
📋 Found 4 blueprint files
⬆️  Uploading blueprints to table: productora_blueprints
✅ Uploaded blueprint: irn:blueprint:sys:entities@0.0.1
✅ Uploaded blueprint: irn:blueprint:irma:schd_actions@0.0.1
✅ Uploaded blueprint: irn:blueprint:irma:schd_jobs@0.0.1
✅ Uploaded blueprint: irn:blueprint:irma:schd_runs@0.0.1

✅ Environment Deployment Complete!

Deployment Summary
=================
Environment Name: productora
AWS Profile    : maker
AWS Region     : us-east-1

DynamoDB Tables
--------------
Table: productora_blueprints
ARN  : arn:aws:dynamodb:us-east-1:339713094352:table/productora_blueprints
Table: productora_entities
ARN  : arn:aws:dynamodb:us-east-1:339713094352:table/productora_entities
Table: productora_rel
ARN  : arn:aws:dynamodb:us-east-1:339713094352:table/productora_rel
Table: productora_chat
ARN  : arn:aws:dynamodb:us-east-1:339713094352:table/productora_chat
Table: productora_data
ARN  : arn:aws:dynamodb:us-east-1:339713094352:table/productora_data

Cognito User Pool
----------------
User Pool ID  : us-east-1_upbl7rMKZ
User Pool ARN : arn:aws:cognito-idp:us-east-1:339713094352:userpool/us-east-1_upbl7rMKZ
App Client ID : 4l6t4s7qfg4mgm2ufdk63k086e

IAM Resources
-------------
Policy Name : productora_tt_policy
Policy ARN  : arn:aws:iam::339713094352:policy/productora_tt_policy
Role Name   : productora_tt_role
Role ARN    : arn:aws:iam::339713094352:role/productora_tt_role

S3
-------------
Bucket ARN : productora-27538944

Blueprints uploaded
-------------
Success : 4 blueprints
Failed  : 0 blueprints
(launch-venv) ricardocid@Mac scripts % 