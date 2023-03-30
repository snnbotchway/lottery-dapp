export interface SolcInput {
    language: string;
    sources: {
        [fileName: string]: {
            content: string;
        };
    };
    settings: {
        optimizer?: {
            enabled: boolean;
            runs: number;
        };
        evmVersion?: string;
        outputSelection?: {
            [fileName: string]: {
                [contractName: string]: string[];
            };
        };
    };
}

export interface Contract {
    abi: any[];
    evm: {
        bytecode: {
            object: string;
        };
    };
}

export interface SolcOutput {
    contracts: {
        [fileName: string]: {
            [contractName: string]: Contract;
        };
    };
}
