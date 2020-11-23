const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function sendMetric(params) {
    if (params.verbose) {
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        console.log(`The event payload: ${payload}`);
    }

    try {
        const response = await fetch(params.server, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${params.dm_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: params.name,
                version: params.version,
                statusPage: params.statuspage,
                repositoryUrl: params.repositoryUrl,
                commitSha: params.commitSha,
                environment: params.environment,
                status: params.status,
                productName: params.productName,
                capabilityName: params.capabilityName,
            }),
        });

        if (response.status !== 201) {
            throw new Error(response.statusText);
        }

        const location = response.headers.get('location');
        const depid = location.split('/').pop();

        console.log(`location: ${location}`);
        console.log(`depid:${depid}`);

        core.setOutput('location', location);
        core.setOutput('depid', depid);
    } catch (error) {
        console.log(error);
        core.setFailed(error.message);
    }
}

async function exec() {
    console.log(`Action started: ${new Date().toTimeString()}`);

    const verbose = core.getInput('verbose');
    const dm_token = core.getInput('dm_token');
    const server = core.getInput('server');
    const name = core.getInput('name');
    const version = core.getInput('version');
    const statusPage = core.getInput('statusPage');
    const repositoryUrl = core.getInput('repositoryUrl');
    const commitSha = core.getInput('commitSha');
    const environment = core.getInput('environment');
    const status = core.getInput('status');
    const productName = core.getInput('productName');
    const capabilityName = core.getInput('capabilityName');
    const depid = core.getInput('depid');

    const metricParams = {
        verbose,
        dm_token,
        server,
        name,
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