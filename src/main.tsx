import '@Assets/App.css';

import ReactDOM from 'react-dom/client';

import { VaultProvider } from './context/VaultContext';
import Router from './Router';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<VaultProvider>
		<Router />
	</VaultProvider>
);
