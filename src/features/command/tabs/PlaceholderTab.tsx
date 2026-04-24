type Props = {
  title: string;
  description: string;
  comingIn: string;
};

export function PlaceholderTab({ title, description, comingIn }: Props) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center">
        <div className="inline-block rounded-full border border-[#14E0E0]/40 bg-[#14E0E0]/10 px-3 py-1 text-[10px] uppercase tracking-widest text-[#14E0E0] mb-4">
          {comingIn}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">{title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">{description}</p>
      </div>
    </div>
  );
}
