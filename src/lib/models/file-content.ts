export interface Method {
    name: string;
    arguments: string[];
    body: string;
}

export interface Variable {
    name: string;
    value: string | null;
    type: string;
    isPrivate: boolean;
    isInput?: boolean;
    isOutput?: boolean;
}

export interface Constructor {
    dependencies: string[];
    context: string | null;
}

export interface LifecycleHook {
    name: string;
    body?: string;
    identifier?: string;
    arguments?: string[];
}

export interface Component {
    selector: string;
    templateUrl: string;
    styleUrls: string[];
}

export interface FileContent {
    type: string;
    moduleName: string | null;
    declaredName: string | null;
    methods: Method[];
    variables: Variable[];
    constructor: Constructor;
    component: Component;
    lifecycleHooks: (string | LifecycleHook)[];
}