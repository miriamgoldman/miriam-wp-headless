import { CoreSeparatorBlock } from '@/lib/wordpress/types';

export default function CoreSeparator({ block }: { block: CoreSeparatorBlock }) {
  const { opacity } = block.attributes;

  const opacityClass = opacity === 'css' ? 'opacity-20' : '';

  return <hr className={`my-8 border-gray-300 ${opacityClass}`} />;
}
