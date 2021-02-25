// import { defaultOpenerTimeoutMs } from "../common/defaultConfig";

// export const checkIsOpenerGlue = (): Promise<boolean> => {
//     if (!window.opener) {
//         return Promise.resolve(false);
//     }

//     const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), defaultOpenerTimeoutMs));
    
//     const ping = new Promise<boolean>((resolve) => {
//         //
//     });

//     return Promise.race([ping, timeout]);
//     // send a post message to opener
//     // type is ping
//     // wait for response 1000MS
// };
