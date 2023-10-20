import { EffectCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TTranslationKey } from "../types/shared-types";

export const useConst = <Value>(initialValue: Value) => {
  return useRef<Value>(initialValue).current;
}
export const usePrev = <Value>(currentValue: Value) => {
  const ref = useRef<Value | null>(null);
	useEffect(() => {
		ref.current = currentValue;
	});
	return ref.current;
}

export const useDidFirstMountEffect = (effect: EffectCallback) => {
  const triggeredRef = useRef<boolean>(false);

	useEffect(() => {
		if (triggeredRef.current) return;
		triggeredRef.current = true;
		return effect();
	});
}
export type TTranslateMeta = (meta: TTranslationKey | string) => string;
export const useMetaTranslate = () => {
	const [_, setIsLoaded] = useState<boolean | undefined>();
	const { t, i18n } = useTranslation();
	return (meta: TTranslationKey | string) => {
		if (typeof meta === "string") return meta;
		const { ns, key } = meta;
		if (!i18n.hasLoadedNamespace(ns)) {
			i18n.loadNamespaces(ns)
				.then(() => setIsLoaded(true));
			return key;
		} else {
			return t(`${ns}:${key}`);
		}
	};
}