import streamlit as st
import time
from streamlit_extras.let_it_rain import rain

def getCalculate(freq):
    total_sum = []
    freq_len = len(freq)

    for i in range(freq_len // 2):
        num = freq[i] + freq[-i -1]
        # Check if result is two digits
        if num > 9:
            total_sum.append(num // 10)
            total_sum.append(num % 10)
        else: 
            total_sum.append(num)

    # If the length of the list is odd, add the median index into the freq
    if freq_len % 2 != 0:
        floordiv = freq_len // 2
        if floordiv == 1:
            total_sum.append(freq[floordiv])
        else:
            total_sum.append(freq[floordiv + 1])
    
    return total_sum

def matchMaker(names):
    # Define a dictionary to store the frequency of letters
    letter_frequency = {}

    # Iterate over each name in the list
    for name in names:
        # Iterate over each character in the name
        for char in name:
            # Check if the character is a letter
            if char.isalpha():
                # Convert the character to lowercase
                char = char.lower()
                # Check if the character is already in the dictionary
                if char in letter_frequency:
                    # If it is, increment the count
                    letter_frequency[char] += 1
                else:
                    # If it isn't, add it to the dictionary with a count of 1
                    letter_frequency[char] = 1

    # Define list for letters and letters frequency
    letters = []
    freq = []

    # Print the frequency of each letter
    for letter, frequency in letter_frequency.items():
        letters.append(letter)
        freq.append(int(frequency))

    st.text(letters)
    st.text(freq)

    # Loop until the length of list is less than 3
    while len(freq) > 2:
        time.sleep(1)
        freq = getCalculate(freq)
        if len(freq) > 2:
            st.text(freq)

    # Combine two index value
    score = str(freq[0]) + str(freq[1])
    with st.spinner('Wait for it...'):
        time.sleep(5)
    st.header(score + '%')
    rain(
        emoji="💘",
        font_size=54,
        falling_speed=5,
        animation_length="infinite",
    )

def main():
    st.set_page_config(
        page_title="Serasi Calculator",
        page_icon=":heart_decoration:",
    )

    st.title(':two_hearts: SERASI CALCULATOR :two_hearts:')
    st.caption('By: Hadi Hafiz')
    st.subheader("Fit for each other, huh? Let's see :eyes:")
    url = "https://www.youtube.com/watch?v=B6VkZaJFVqU"
    st.write("Inspired by a childhood game :arrow_right: [How to Play](%s)" % url)

    st.info(
        """

        ###### **Disclaimer**

        * ###### This app is not a fortune-telling tool and should be used for entertainment purposes only.

        * ###### The results provided by the app are not intended to be taken seriously or as a source of factual information.

        * ###### The creator of this app do not claim to possess any supernatural abilities or powers, and any predictions made by the app should be taken with a grain of salt.

        * ###### Users are solely responsible for any decisions they make based on the results provided by the app.
        
        * ###### No data is taken during app usage. Your personal information and data are kept strictly confidential and are not shared with any third party.

        """
        , icon="ℹ️"
    )

    names = []

    with st.form("nameform"):
        name1 = st.text_input('Name:')
        name2 = st.text_input("Partner's Name:")

        # Every form must have a submit button.
        submitted = st.form_submit_button("Calculate")
        if submitted:
            names.append(name1)
            names.append(name2)
            matchMaker(names)

    if st.button('Try Again!'):
        st.experimental_rerun()

if __name__ == '__main__':
    main()
