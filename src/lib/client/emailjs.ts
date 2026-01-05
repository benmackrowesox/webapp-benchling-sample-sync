import emailjs from "@emailjs/browser";
import { emailJSConfig, firebaseConfig } from "src/public-config";

// TODO: should name these better
export const EMAILJS_TEMPLATES = {
	ORDER_STATUS_CHANGED: "template_bnzfnao",
	NEW_USER: "template_xvah6ov",
};

// TODO: give Ben's service a better id and don't forget to switch in prod
const EMAILJS_SERVICES = {
	BEN: "service_jvf5n2k",
	ALINA: "service_alina_dev",
};

export const sendEmail = async (
	templateId: string,
	templateParams: Record<string, unknown> | undefined,
) => {
	if (firebaseConfig?.projectId?.includes("test")) {
		console.log(
			"In test mode, will not send email: ",
			templateId,
			templateParams,
		);
		return;
	}

	await emailjs
		.send(
			EMAILJS_SERVICES.BEN,
			templateId,
			templateParams,
			emailJSConfig.publicKey,
		)
		.catch((err) => {
			console.error(err);
		});
};
