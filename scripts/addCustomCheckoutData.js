const formTemplate = document.querySelector('.js-per-student-info-form');
formTemplate.remove();
formTemplate.setAttribute('id', null);
formTemplate.classList.add('js-student-info-form');
const submitButton = cloneSubmitButton();
const notesInput = document.querySelector('#wf-ecom-notes');

/**
 * @type {Record<string, HTMLFormElement[]>}
 */
const allForms = {};

function createAllStudentDetailsForms() {
	document.querySelectorAll('.js-remove-me').forEach(x => x.remove());

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
	const count = parseInt(container.querySelector('.js-order-item-student-count').innerHTML);
	const productLink = container.querySelector('.js-order-item-link').getAttribute('href');
	const existingForms = container.querySelectorAll('.js-student-info-form');

	if (isNaN(count)) {
		console.error('Could not create student details form for class');
		container.remove();
		return;
	}

	const forms = [];
	if (!allForms[productLink]) {
		allForms[productLink] = forms;
	}

	if (existingForms.length < count) {
		for (let i = 0; i < count - existingForms.length; i++) {
			const form = formTemplate.cloneNode(true);
			if (form instanceof HTMLFormElement) {
				form.querySelector('.js-student-details-form-header').textContent = 'Student ' + (i + 1) + ' details';
				container.appendChild(form);
				forms.push(form);
			}
		}
	}

	if (existingForms.length > count) {
		for (let i = existingForms.length - 1; i > count; i--) {
			existingForms.item(i).remove();
		}
	}
}

function purgeOrphanedForms() {
	for (const key of Object.keys(allForms)) {
		allForms[key] = allForms[key].filter(form => form.isConnected);

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
	const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	if (MutationObserver) {
		const observer = new MutationObserver(createAllStudentDetailsForms);

		observer.observe(orderItemContainer, { childList: true, subtree: true });
	} else {
		orderItemContainer.addEventListener('DOMNodeInserted', createAllStudentDetailsForms, false);
		orderItemContainer.addEventListener('DOMNodeRemoved', createAllStudentDetailsForms, false);
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
		return existingClone;
	}

	const originalSubmitButton = document.querySelector('#checkout-submit');
	const submitButtonClone = originalSubmitButton.cloneNode(true);
	submitButtonClone.setAttribute('id', 'checkout-submit-clone');
	submitButtonClone.removeAttribute('data-node-type');

	originalSubmitButton.after(submitButtonClone);
	originalSubmitButton.classList.add('hidden');
	submitButtonClone.addEventListener('click', function() {
		if (!validateForms()) {
			return;
		}

		const values = getFormValues();
		notesInput.value = JSON.stringify(values);
		originalSubmitButton.click();
	});

	return submitButtonClone;
}

createAllStudentDetailsForms();
keepFormsInDocument();
