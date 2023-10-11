// Create a class for the element
class ValidationElement extends HTMLElement {
  constructor() {
    super();

    // get the for attribute
    this.controlId = this.getAttribute("for");

    // bail if there is no for attribute
    if (this.controlId === null) {
      console.warn("ValidationElement must have a for attribute");
    }

    // get the control
    this.control = document.getElementById(this.controlId);

    // bail if there is no matching control
    if (this.control === null) {
      console.warn(
        "ValidationElement has a for attribute but no matching control"
      );
    }

    if (this.control instanceof HTMLFormElement) {
      this.submitButton = this.control.querySelector("[type=submit]");

      if (this.submitButton === null) {
        console.warn(
          "ValidationElement has a for attribute that is a form but no submit button"
        );
      }
    }

    this.control.validationElement = this;

    this.control.addEventListener("invalid", (e) => e.preventDefault());

    // handle validation
    if (this.control instanceof HTMLFormElement) {
      this.submitButton.addEventListener("click", () => {
        this.validate();
        this.control.addEventListener("change", () => this.validate());
      });
    } else {
      this.control.addEventListener("change", () => this.validate());
      this.control.addEventListener("input", () => {
        console.log(this.control.isValidated);
        if (this.control.isValidated) {
          this.validate();
        }
        this.innerText = "";
        this.control.isValidated = false;
      });
    }
  }

  getValidationMessage(input, prefix = false) {
    let validationMessage = input.validationMessage;
    if (prefix) {
      let labels = [...(input?.labels || [])];
      if (labels.length === 0) {
        return validationMessage;
      }
      labels = labels.map((label) => label.innerText);

      validationMessage = `${labels.join(" ")}: ${input.validationMessage}`;
    }
    return validationMessage;
  }

  validateInput(input) {
    input.isValidated = true;
    // check if valid
    let ValidationElement = input?.validationElement || this;
    if (!input.checkValidity()) {
      ValidationElement.innerText = this.getValidationMessage(input);
    } else {
      ValidationElement.innerText = "";
    }
  }

  validateForm(form) {
    let messages = [];
    for (let input of form) {
      if (!input.checkValidity()) {
        this.validateInput(input);
        let validationMessage = this.getValidationMessage(input, true);
        if (validationMessage) {
          messages.push(validationMessage);
        }
      }
    }

    if (messages.length > 0) {
      this.innerText = messages.join("\n ");
    } else {
      this.innerText = "";
    }
  }

  validate() {
    if (this.control instanceof HTMLFormElement) {
      this.validateForm(this.control);
    } else {
      this.validateInput(this.control);
    }
  }
}

customElements.define("input-validation", ValidationElement);
// customElements.define("form-validation", formValidation);

// form test
document.querySelectorAll("#form").forEach((e) => {
  e.addEventListener("submit", (e) => e.preventDefault());
});
