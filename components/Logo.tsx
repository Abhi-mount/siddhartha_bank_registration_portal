import Image from "next/image";

type LogoProps = {
  showText?: boolean;
  compact?: boolean;
  inverse?: boolean;
};

export function Logo(_props: LogoProps) {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/logo.jpeg"
        alt="Bank logo"
        width={180}
        height={78}
        priority
        className="h-auto w-[180px] object-contain"
      />
    </div>
  );
}
