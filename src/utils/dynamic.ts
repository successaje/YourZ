import dynamic from 'next/dynamic';

export function dynamicWrapper<P = {}>(
  loader: () => Promise<React.ComponentType<P>>,
  options?: Parameters<typeof dynamic>[1]
) {
  return dynamic(loader, {
    ...options,
    ssr: options?.ssr ?? false,
  });
}
