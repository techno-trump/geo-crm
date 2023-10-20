import { createContext, useState, useContext } from "react";
import { IRCBaseProps } from "../types/shared-types";
import clsx from "clsx";

interface IDisclosureContext {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	toggle: () => void;
}
export const DisclosureContext = createContext<IDisclosureContext>({
		isOpen: false,
		setIsOpen: () => {},
		toggle: () => {}
	});

interface IDisclosureProps {
	openOnInit?: boolean;
	children?: React.ReactNode;
}

const Disclosure = ({ openOnInit, children }: IDisclosureProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(openOnInit || false);
	return (
		<DisclosureContext.Provider value={{ isOpen, setIsOpen, toggle: () => setIsOpen((isOpen) => !isOpen) }}>
			{children}
		</DisclosureContext.Provider>
	);
}
interface IHeaderProps extends IRCBaseProps {
	openClassName?: string;
	asController?: boolean;
}
Disclosure.Header = ({ children, className, openClassName, asController = true }: IHeaderProps) => {
	const { isOpen, toggle } = useContext(DisclosureContext);
	return (
		<div className={clsx(className, isOpen && openClassName)} onClick={asController ? toggle : undefined}>
			{children}
		</div>
	);
}
interface IBodyProps extends IRCBaseProps {
	openClassName?: string;
}
Disclosure.Body = ({ children, className, openClassName }: IBodyProps) => {
	const { isOpen } = useContext(DisclosureContext);
	return (
		<div className={clsx(className, "disclosure", isOpen && (openClassName || "open"))}>
			<div className="disclosure__inner">
				{children}
			</div>
		</div>
	);
}
export default Disclosure;