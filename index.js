const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function sendMetric(params) {
    try {
        const response = await fetch(params.server, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${params.dm_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: params.name,
                createdAt: params.createdAt,
                updatedAt: new Date().toISOString(),
                version: params.version,
                statusPage: params.statuspage,
                repositoryUrl: params.repositoryUrl,
                commitSha: params.commitSha,
                environment: params.environment,
                status: params.status,
                productName: params.productName,
                capabilityName: params.capabilityName,
                depid: params.depid
            }),
        });

        if (response.status !== 201) {
            throw new Error(response.statusText);
        }

        const location = response.headers.get('location');

        if (location) {
            const depid = location.split('/').pop();
            console.log(`location: ${location}`);
            console.log(`depid:${depid}`);
            core.setOutput('location', location);
            core.setOutput('depid', depid);
        }
    } catch (error) {
        console.log(error);
        core.setFailed(error.message);
    }
}

async function exec() {
    const verbose = core.getInput('verbose');
    const dm_token = core.getInput('dm_token');
    const server = core.getInput('server');
    const name = core.getInput('name');
    const createdAt = core.getInput('createdAt');
    const updatedAt = core.getInput('updatedAt');
    const version = core.getInput('version');
    const statusPage = core.getInput('statusPage');
    const repositoryUrl = core.getInput('repositoryUrl');
    const commitSha = core.getInput('commitSha');
    const environment = core.getInput('environment');
    const status = core.getInput('status');
    const productName = core.getInput('productName');
    const capabilityName = core.getInput('capabilityName');
    const depid = core.getInput('depid');

    if (verbose === 'true') {
        console.log(`Action started: ${new Date().toTimeString()}`);
        console.log(JSON.stringify(github.context.payload, undefined, 2));
    }

    // Set outputs by just calling the action with no parameters
    if (status === 'created' || status === '') {
        const createdAt = new Date().toISOString();
        console.log(`createdAt: ${createdAt}`);
        console.log(`githubRepositoryName: ${github.context.payload.repository.name}`);
        console.log(`githubRepositoryHtmlUrl: ${github.context.payload.repository.html_url}`);
        core.setOutput('createdAt', createdAt);
        core.setOutput('githubRepositoryName', github.context.payload.repository.name);
        core.setOutput('githubRepositoryHtmlUrl', github.context.payload.repository.html_url);

        const branch = github.context.payload.ref.split('/').pop();
        let localExtensionEnvironment = 'local';
        switch (branch) {
            case 'master':
                localExtensionEnvironment = 'cte'
                break;
            case 'release':
                localExtensionEnvironment = 'production'
                break;
            case 'staging':
                localExtensionEnvironment = 'ppe'
                break;
            default:
                break;
        }
        console.log(`localExtensionEnvironment: ${localExtensionEnvironment}`);
        core.setOutput('localExtensionEnvironment', localExtensionEnvironment);
        return;
    }

    const metricParams = {
        dm_token,
        server,
        name,
        createdAt,
        updatedAt,
        version,
        statusPage,
        repositoryUrl,
        commitSha,
        environment,
        status,
        productName,
        capabilityName,
        depid,
    };

    await sendMetric(metricParams);
}

exec();
