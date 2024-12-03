declare module "cookie" {
  const value: any;
  export default value;
  export function parse(str: string): { [key: string]: string };
  export function serialize(name: string, value: string, options?: any): string;
}
