import streamlit as st
import requests
from constants import BACKEND_API_ENDPOINT


def main():
    st.title("Greeting App")

    name = st.text_input("Enter your name")

    if st.button("Greet"):
        if not name.strip():
            st.warning("Please enter a name.")
            return

        try:
            response = requests.post(
                f"{BACKEND_API_ENDPOINT}/jobs/greet",
                json={"name": name},
            )
            response.raise_for_status()
            result = response.json()
            st.success(result["name"])
        except requests.exceptions.RequestException as e:
            st.error(f"Failed to reach the backend: {e}")


if __name__ == "__main__":
    main()
