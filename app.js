// Selects the input field from the 'search' 
const form = document.querySelector('.top-banner form');
const input = document.querySelector('.top-banner input[type="text"]');
const msg = document.querySelector('.top-banner .msg')
const apiKey = 'c36c96d8921336a06c51254d2feba440'


// When form is submitted, value from 'input' element is placed into variable, and stop the form from submitting (we don't want page reloading)
// Async function - so only continues once data has been fetched, meaning the variables for lon and lat can go in here
form.addEventListener('submit', async e => {
    e.preventDefault()
    let inputVal = input.value

    // We now need to make a request to our Weather API using AJAX
    // We need to convert the location inputted by user into lat/long for weather API

    try {
        const geoData = await getGeoData(inputVal);
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        console.log('Latitude:', lat); // Add this line
        console.log('Longitude:', lon); // Add this line

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(weatherData => {
                msg.textContent = "";
                form.reset(); // Clears the form after every search
                input.focus();

                
                // Displaying API data on the website
                const { main, name, sys, weather } = weatherData; // Important information from API
                const icon = `https://openweathermap.org/img/wn/${weather[0]["icon"]}@2x.png`;
                const li = document.createElement("li");
                const list = document.querySelector(".cities")
                const markup = `
                    <h2 class="city-name" data-name="${name},${sys.country}"> 
                        <span>${name}</span> 
                        <sup>${sys.country}</sup> 
                        </h2> 
                        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup> 
                        </div> 
                        <figure> 
                        <img class="city-icon" src=${icon} alt=${weather[0]["main"]}> 
                        <figcaption>${weather[0]["description"]}</figcaption> 
                        </figure>
                        `;

                // Ensure each city is searched once only
                const listItems = list.querySelectorAll('.ajax-section .city')
                const listItemsArray = Array.from(listItems) // Create an array from the list

                if (listItemsArray.length > 0){
                    
                    const filteredArray = listItemsArray.filter(el => {
                        let content = ''

                        // If the input includes a comma, only the first part of the input is kept
                        if (inputVal.includes(',')){
                            if(inputVal.split(',')[1].length > 2){
                                inputVal = inputVal.split(',')[0]
                                content = el.querySelector('.city-name span').textContent.toLowerCase()
                            } else {
                                content = el.querySelector('.city-name').dataset.name.toLowerCase()
                            }
                        } else {
                            content = el.querySelector('.city-name span').textContent.toLowerCase();
                        } 
                        return content == inputVal.toLowerCase()
                    })
                    if (filteredArray.length > 0){
                        msg.textContent = `You already know the weather for ${
                            filteredArray[0].querySelector(".city-name span").textContent
                          } ...otherwise be more specific by providing the country code as well 😉`;
                          form.reset();
                          input.focus();
                          return;
                    }
                }

                li.classList.add("city");
                li.innerHTML = markup;
                list.appendChild(li);

                console.log(weatherData)
                return weatherData
            })

    } catch (error) {
        msg.textContent = "Please search for a valid city 😩";
        console.error(error);
    }
})


// Function to get the geo data to input into the weather API
// City name will be passed based on inputVal
async function getGeoData(cityName) {
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}` // Will return lat + lon for weather_url

    try {
        const response = await fetch(geoUrl);
        // Converts response to json
        const geoData = await response.json();

        if (geoData.length === 0) {
            throw new Error('No matching cities found');
        }

        if (geoData.length > 0) {
            console.log(geoData);
            return geoData // Must return the data from the API
        }

    } catch (error) {
        msg.textContent = "Please search for a valid city 😩";
        console.error(error);
        return null
    }
}

