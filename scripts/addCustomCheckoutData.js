//# sourceURL=addCustomCheckoutData.js
const localStorageKey = 'ibaa-student-info-draft';
const formTemplate = document.querySelector('.js-per-student-info-form');
formTemplate.remove();
formTemplate.setAttribute('id', null);
formTemplate.classList.add('js-student-info-form');
let submitButton = cloneSubmitButton();
let notesInput = document.querySelector('#wf-ecom-notes');

/**
 * @type {Record<string, HTMLFormElement[]>}
 */
const allForms = {};

function initializeForms() {
	notesInput = document.querySelector('#wf-ecom-notes');
	submitButton = cloneSubmitButton();
	document.querySelectorAll('.js-remove-me').forEach((x) => x.remove());
	document
		.querySelectorAll('.js-hide-me')
		.forEach((x) => x.classList.add('hidden'));

	const containers = document.querySelectorAll('.js-student-details-container');

	for (const container of containers) {
		createStudentDetailsForm(container);
	}

	purgeOrphanedForms();
}

/**
 * @param {Element} container
 */
function createStudentDetailsForm(container) {
	const count = parseInt(
		container.querySelector('.js-order-item-student-count').innerHTML
	);
	const productLink = container
		.querySelector('.js-order-item-link')
		.getAttribute('href');

	if (!productLink) {
		console.error('Could not find product identifier for class', productLink);
		container.remove();
		return;
	}

	if (isNaN(count)) {
		console.error(
			'Could not create student details form for class',
			productLink
		);
		container.remove();
		return;
	}

	if (count === 0) {
		console.warn('encountered class with 0 students', productLink);
		return;
	}

	const draftValues = getDraftFormValues();

	if (!allForms[productLink]) {
		allForms[productLink] = [];
	}

	const forms = allForms[productLink];
	const existingFormCount = forms.length;
	const missingFormCount = count - forms.length;

	for (const existingForm of forms) {
		if (existingForm.isConnected) {
			continue;
		}

		container.appendChild(existingForm);
	}

	for (let i = 0; i < missingFormCount; i++) {
		const form = formTemplate.cloneNode(true);
		if (form instanceof HTMLFormElement) {
			const absoluteIndex = i + existingFormCount;
			form.querySelector('.js-student-details-form-header').textContent =
				'Student ' + (absoluteIndex + 1) + ' details';
			container.appendChild(form);
			forms.push(form);

			if (
				draftValues &&
				draftValues[productLink] &&
				draftValues[productLink][absoluteIndex]
			) {
				updateFormWithSavedValues(
					form,
					draftValues[productLink][absoluteIndex]
				);
			}
		}
		form.addEventListener('change', saveDraftFormValues);
	}

	while (forms.length > count) {
		const formToRemove = forms.pop();
		if (formToRemove) {
			formToRemove.remove();
		}
	}
}

function purgeOrphanedForms() {
	for (const key of Object.keys(allForms)) {
		allForms[key] = allForms[key].filter((form) => form.isConnected);

		if (!allForms[key].length) {
			delete allForms[key];
		}
	}
}

function keepFormsInDocument() {
	const orderItemContainer = document.querySelector('#order-items');

	/**
	 * @type {typeof window.MutationObserver}
	 */
	const MutationObserver =
		window.MutationObserver || window.WebKitMutationObserver;

	if (MutationObserver) {
		const observer = new MutationObserver(initializeForms);

		observer.observe(orderItemContainer, { childList: true, subtree: true });
	} else {
		orderItemContainer.addEventListener(
			'DOMNodeInserted',
			initializeForms,
			false
		);
		orderItemContainer.addEventListener(
			'DOMNodeRemoved',
			initializeForms,
			false
		);
	}
}

function getFormValues() {
	const allResults = {};
	for (const key of Object.keys(allForms)) {
		const forms = allForms[key];
		const results = [];

		for (const form of forms) {
			const inputs = form.querySelectorAll('input');
			const result = {};
			for (const input of inputs) {
				result[input.getAttribute('data-name')] = {
					value: input.value,
					column: input.getAttribute('data-column'),
				};
			}
			results.push(result);
		}

		allResults[key] = results;
	}
	return allResults;
}

function validateForms() {
	let isValid = true;
	for (const forms of Object.values(allForms)) {
		for (const form of forms) {
			if (!form.reportValidity()) {
				isValid = false;
			}
		}
	}
	return isValid;
}

function cloneSubmitButton() {
	const existingClone = document.querySelector('#checkout-submit-clone');
	if (existingClone) {
		if (existingClone.classList.contains('hidden')) {
			existingClone.classList.remove('hidden');
		}
		return existingClone;
	}

	const originalSubmitButton = document.querySelector('#checkout-submit');
	const submitButtonClone = originalSubmitButton.cloneNode(true);
	submitButtonClone.setAttribute('id', 'checkout-submit-clone');
	submitButtonClone.removeAttribute('data-node-type');

	originalSubmitButton.after(submitButtonClone);
	originalSubmitButton.classList.add('hidden');
	submitButtonClone.addEventListener('click', submitCheckout);

	return submitButtonClone;
}

function submitCheckout() {
	if (!validateForms()) {
		return;
	}

	clearDraftFormValues();
	const values = getFormValues();
	notesInput.value = JSON.stringify(values);
	const originalSubmitButton = document.querySelector('#checkout-submit');
	originalSubmitButton.click();
}

function clearDraftFormValues() {
	localStorage.removeItem(localStorageKey);
}

function saveDraftFormValues() {
	const formValues = getFormValues();
	localStorage.setItem(localStorageKey, JSON.stringify(formValues));
}

function getDraftFormValues() {
	const draft = localStorage.getItem(localStorageKey);
	if (draft) {
		return JSON.parse(draft);
	}
}

/**
 * @param {HTMLFormElement} form
 * @param {Record<string, string>} values
 */
function updateFormWithSavedValues(form, values) {
	for (const name of Object.keys(values)) {
		const input = form.querySelector(
			'[data-name="' + name.replace(/"/g, '"') + '"]'
		);
		if (input && values[name] && typeof values[name].value === 'string') {
			input.value = values[name].value;
		}
	}
}

initializeForms();
keepFormsInDocument();
