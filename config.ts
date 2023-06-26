
interface IConfig {
    allowCORS: false | "*" | string[];
}

const config:IConfig = {
    allowCORS: "*",
}

export default config;