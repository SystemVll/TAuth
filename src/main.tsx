import '@Assets/App.css';

import ReactDOM from 'react-dom/client';

import { VaultProvider } from './context/VaultContext.tsx';
import Router from './Router.tsx';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<VaultProvider>
		<Router />
	</VaultProvider>
);
