
import {isAuthenticated} from "@/plugins/components";

export default function({store, req, redirect}) {
	if (process.server && !req) return;

	const authenticated = process.server ? req.ctx.state.user : isAuthenticated();

	//console.log(isAuthenticated);
	
	if (!authenticated) {
		return redirect("/note/login");
	}

}
