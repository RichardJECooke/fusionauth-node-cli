import {Command} from 'commander';
import {FusionAuthClient} from '@fusionauth/typescript-client';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {mkdir, writeFile} from 'fs/promises';
import * as types from '../types.js';
import * as util from '../utils.js';

const action = async function (lambdaId: string, clioptions: types.CLILambdaOptions) {
    const options = util.validateLambdaOptions(clioptions);
    console.log(`Updating lambda ${lambdaId} on ${options.host}`);
    try {
        const fusionAuthClient = new FusionAuthClient(options.apiKey, options.host);
        const clientResponse = await fusionAuthClient.retrieveLambda(lambdaId);
        if (!clientResponse.wasSuccessful())
            util.errorAndExit(`Error retrieving lamba ${lambdaId}: `, clientResponse);
        if (!fs.existsSync(options.output))
            await mkdir(options.output);
        const filename = path.join(options.output, clientResponse.response.lambda?.id + ".json");
        await writeFile(filename, util.toJson(clientResponse.response.lambda));
        console.log(chalk.green(`Lambda downloaded to ${filename}`));
    }
    catch (e: unknown) {
        util.reportError(`Error retrieving lamba ${lambdaId}:`, e);
        process.exit(1);
    }
}

export const lambdaUpdate = new Command('lambda:update')
    .description('Update a lambda on FusionAuth')
    .argument('<lambdaId>', 'The lambda id to update')
    .option('-i, --input <input>', 'The input directory', './lambdas/')
    .option('-k, --key <key>', 'The API key to use')
    .option('-h, --host <url>', 'The FusionAuth host to use', 'http://localhost:9011')
    .action(action);