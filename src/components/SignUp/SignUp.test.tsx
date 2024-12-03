import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import React from "react";
import SignUp from "./";
import { mockedSuccessUser, mockedUnSuccessUser, mockedUser } from "./fixture";
import { handlers } from "./handlers";
import { User } from "./Types";
import { debug } from "jest-preview";
import axios from "axios";
// Setting up the mock server
const server = setupServer(...handlers);

const getters = {
  getUsernameInput: () => screen.getByLabelText(/^User Name/),
  getEmailInput: () => screen.getByLabelText(/^Email Address/),
  getPasswordInput: () => screen.getByLabelText(/^Password/),
  getSignUpButton: () => screen.getByRole("button", { name: /Sign Up/ }),
};

export const signUpUser = async (mockedUser: User) => {
  const emailInput = getters.getEmailInput();
  const passwordInput = getters.getPasswordInput();
  const userNameInput = getters.getUsernameInput();
  const signUpButton = getters.getSignUpButton();

  await userEvent.type(userNameInput, mockedUser.username);
  await userEvent.type(emailInput, mockedUser.email);
  await userEvent.type(passwordInput, mockedUser.password);
  expect(userNameInput).toHaveValue(mockedUser.username);
  expect(emailInput).toHaveValue(mockedUser.email);
  expect(passwordInput).toHaveValue(mockedUser.password);
  await userEvent.click(signUpButton);
};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SignUp Component", () => {
  afterEach(() => jest.resetAllMocks());
  describe("Validation", () => {
    afterEach(() => jest.resetAllMocks());

    it("should display validation errors for invalid email", async () => {
      render(<SignUp />);
      const emailInput = getters.getEmailInput();
      await userEvent.type(emailInput, "test");
      userEvent.click(document.body);
      const validationMsg = await screen.findByText(/Enter a valid email/i);
      expect(validationMsg).toBeVisible()
    });

    it("should display validation errors for short password", async () => {
      render(<SignUp />);
      const passwordInput = getters.getPasswordInput();
      await userEvent.type(passwordInput, "123");
      userEvent.click(document.body);
      const validationMsg = await screen.findByText('Password should be of minimum 8 characters length');
      expect(validationMsg).toBeInTheDocument();
    });

    it("should display success message on successful sign-up", async () => {
      render(<SignUp />);
      await signUpUser(mockedUser);
      const successMsg = await screen.findByText("Sign Up Successfully!");
      expect(successMsg).toBeInTheDocument();
    });

    it("should display error message on sign-up failure", async () => {
      render(<SignUp />);
      await signUpUser(mockedUnSuccessUser);
      const errorMsg = await screen.findByText(/Error Signing Up!/);
      expect(errorMsg).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    afterEach(() => jest.resetAllMocks());
    it("should enable Sign Up button when form is valid", async () => {
      render(<SignUp />);
      const userNameInput = getters.getUsernameInput();
      const emailInput = getters.getEmailInput();
      const passwordInput = getters.getPasswordInput();
      const signUpButton = getters.getSignUpButton();

      await userEvent.type(userNameInput, mockedUser.username);
      await userEvent.type(emailInput, mockedUser.email);
      await userEvent.type(passwordInput, mockedUser.password);
      expect(signUpButton).toBeEnabled();
    });

    it("should disable Sign Up button when form is invalid", async () => {
      render(<SignUp />);
      const signUpButton = getters.getSignUpButton();
      expect(signUpButton).toBeDisabled();
    });

    it("should update form fields on user input", async () => {
      render(<SignUp />);
      const userNameInput = getters.getUsernameInput();
      const emailInput = getters.getEmailInput();
      const passwordInput = getters.getPasswordInput();

      await userEvent.type(userNameInput, mockedUser.username);
      await userEvent.type(emailInput, mockedUser.email);
      await userEvent.type(passwordInput, mockedUser.password);
      expect(userNameInput).toHaveValue(mockedUser.username);
      expect(emailInput).toHaveValue(mockedUser.email);
      expect(passwordInput).toHaveValue(mockedUser.password);
    });

    it("should redirect user to home page after successful signup", async () => {
      render(<SignUp />);
      await signUpUser(mockedUser);
      const productsText = await screen.findByText(/^products/i);
      expect(productsText).toBeInTheDocument();
    });

    it("should show loading state on sign-up button during form submission", async () => {
      render(<SignUp />);
      const signUpButton = getters.getSignUpButton();
      await signUpUser(mockedUser);
      expect(signUpButton).toHaveAttribute("disabled");
    });
  });
});
