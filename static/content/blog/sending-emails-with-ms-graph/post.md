---
date: 2024-08-10T12:00:00.000+10:00
tags: [ "azure", "graphql", "javascript", "typescript" ]
title: Sending Emails with the Microsoft Graph API
description: Learn how to send emails programmatically using the Microsoft Graph API with this step by step guide.
slug: sending-emails-with-ms-graph
imageHref: /content/blog/sending-emails-with-ms-graph/images/cover-800x500.png
imageAlt: Microsoft Entra ID logo
---

Recently I have been exploring options for sending emails programmatically for a contact form and found that most
email services are expensive and include a lot of marketing focused features that I don't need. I instead opted to use
a cheap Exchange Online plan and the Microsoft Graph API. Here's how you can do it too!

<!--endintro-->

## Prerequisites

- Microsoft 365 account with an active Exchange mailbox.
- Microsoft 365 account with administrator access to the [Azure Portal](https://portal.azure.com).

Information about Exchange Online plans can be
found [here](https://www.microsoft.com/en-au/microsoft-365/exchange/compare-microsoft-exchange-online-plans). At the
time of writing the lowest plan costs only $6 AUD per month.

## Azure Setup

In order for your application to send emails using the Microsoft Graph API you need to generate credentials in Azure
that will allow it to authenticate and send emails.

### 1. Create an Enterprise Application

To allow your application to authenticate and integrate with Azure services you will need to create an Enterprise
Application in Entra ID. The Enterprise Application will represent your application in Azure and will be used to assign
permissions and generate credentials.

Log in to the **[Azure Portal](https://portal.azure.com)** and navigate to **Entra ID** > **Enterprise Applications**.

![The Azure Entra ID portal home screen with the 'Enterprise applications' button highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-01-1920x1200.png)

Click **New application**.

![The Azure Entra ID portal 'Enterprise applications' screen with the 'New application' button highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-02-1920x1200.png)

Click **Create your own application**, give your application a name, select the option **Register an application to
integrate with Microsoft Entra ID**, and click **Create**.

![The 'Microsoft Entra Gallery' screen with the 'Create your own application' button highlighted and the create dialog open](/content/blog/sending-emails-with-ms-graph/images/screenshot-03-1920x1200.png)

Select the option **Accounts in this organizational directory only** and click **Register**.

![The 'Register an application' screen](/content/blog/sending-emails-with-ms-graph/images/screenshot-04-1920x1200.png)

### 2. Grant Permissions

The Enterprise Application should now be created, but it will not be able to do anything useful until it is
granted permissions. You will need to grant the **Mail.ReadWrite** and **Mail.Send** permissions in order to send
emails.

> For security reasons, only ever grant the minimum permissions required.

Navigate to **Entra ID** > **App registrations** > **All applications** and open the application you just created.

![The 'App registrations' screen with the 'All applications' tab highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-05-1920x1200.png)

Navigate to **API permissions**, click **Add a permission**, then click **Microsoft Graph**.

![The 'API permissions' screen under the app registration with the 'Add a permission' and 'Microsoft Graph' buttons highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-06-1920x1200.png)

Select **Application permissions**, search for the permission **Mail.ReadWrite** and **Mail.Send** and select them, then
click **Add permissions**.

![The settings screen for the Microsoft Graph API permission](/content/blog/sending-emails-with-ms-graph/images/screenshot-07-1920x1200.png)

Click **Grant admin consent** to activate the permissions.

![The 'API permissions' screen under the app registration with the 'Grant admin consent' button highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-08-1920x1200.png)

### 3. Generate a Client Secret

The final step in setting up your Enterprise Application is to generate a client secret, which can be thought of as a
password. This password will be used by your application to authenticate with Azure.

Multiple client secrets can be generated for an Enterprise Application, which can be used to rotate credentials or
revoke access.

Navigate to **Certificates & secrets** and click **New client secret**.

![The 'Certificates & secrets' screen under the app registration with the 'New client secret' button highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-09-1920x1200.png)

Give your client secret a description, set the expiry date, and click **Add**.

> The client secret will only be displayed once and cannot be retrieved again.

## Application Setup

Once the Azure setup is complete you can use the credentials generated to authenticate your application and send emails.
Microsoft maintains SDKs in multiple languages that make authenticating and calling the API easy.

In this example I will be using the TypeScript SDK. To see the full list of SDKs available visit
the [Microsoft Graph SDKs](https://learn.microsoft.com/en-us/graph/sdks/sdks-overview#supported-languages)
page.

### 1. Gather Secrets

For your application to authenticate it will need three secrets:

- Tenant ID
- Client ID
- Client Secret

You should already have your client secret from the previous step. To find the remaining secrets navigate to
**Entra ID** > **App registrations** > **All applications** and open the Enterprise Application you just created.

![The app registration overview screen with the 'Application (client) ID' and 'Directory (tenant) ID' fields highlighted](/content/blog/sending-emails-with-ms-graph/images/screenshot-10-1920x1200.png)

### 2. Install Packages

If you haven't already, create a new project and install the packages below using your package manager of choice.

```bash
npm install @azure/identity
npm install @microsoft/microsoft-graph-client
```

### 3. Create the Graph Client

When creating a graph client you will need to provide the three secrets required to authenticate with Azure. Ensure that
you store and handle these secrets securely and never use them on the frontend.

I recommend using a utility function to create the graph client like I do below. This will make it easier to reuse the
code if you need to create it in more than one place.

> All code in this guide must be run on a server or backend service as it requires access to the client secrets.

```typescript
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import {
	TokenCredentialAuthenticationProvider,
	type TokenCredentialAuthenticationProviderOptions
} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

export async function getGraphClient(tenantId: string, clientId: string, clientSecret: string) {
	const tokenCredential = new ClientSecretCredential(tenantId, clientId, clientSecret);
	const options: TokenCredentialAuthenticationProviderOptions = { scopes: ["https://graph.microsoft.com/.default"] };

	//Create an instance of the TokenCredentialAuthenticationProvider by passing the tokenCredential instance and options to the constructor
	const authProvider = new TokenCredentialAuthenticationProvider(tokenCredential, options);
	return Client.initWithMiddleware({
		debugLogging: false,
		authProvider: authProvider,
	});
}
```

### 4. Send an Email

Once you have the graph client, you will need to construct a payload that represents the email you want to send.
Microsoft maintains the [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) which is invaluable
for testing and debugging your requests and provides examples for payloads.

```typescript
const client = await getGraphClient(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
const payload = {
	message: {
		subject: 'Hello from the Microsoft Graph API',
		body: {
			contentType: 'Text',
			content: 'This is a test email sent from the Microsoft Graph API.'
		},
		toRecipients: [
			{
				emailAddress: {
					address: 'me@jackreimers.dev'
				}
			},
			{
				emailAddress: {
					//Variables can also be used when building the payload
					address: userEmailAddress
				}
			}
		]
	},
	//This will not save the email to the sent items folder
	saveToSentItems: 'false'
};

await client.api('https://graph.microsoft.com/v1.0/users/<EMAIL>/sendMail').post(payload);
```

## Considerations

Due to application permissions being used, the credentials generated for this application are able to read the emails of
any user in your tenant and send emails as them without their knowledge.
Consider the security implications of this and in cases where you only need to send emails on behalf of a specific user,
or you want to require user consent, it may be better to use delegated permissions.

This implementation of emailing is also basic and does not include many of the marketing and analytics features that are
provided by other solutions. If you require these features you may be better off using a third-party email service.

## Conclusion

In this guide I have shown you a cost-effective way to send emails programmatically by setting up an Enterprise
Application in Azure and using the Microsoft Graph API, avoiding the need to use a high cost third-party email service.

Sending emails is only the tip of the iceberg when it comes to what you can do with the Microsoft Graph API. I encourage
you to explore what it can do and how it can be used in your application!
