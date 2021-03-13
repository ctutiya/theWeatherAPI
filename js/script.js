$(document).ready(() => {
    const apiKey = 'bf2ab7434f1583f2e87f12808e45b585'

    const cityDefault = 'Vancouver, CA'

    const unitsStandard = 'standard' // Temperature in Kelvin
    const unitsMetric = 'metric' // Temperature in Celsius
    const unitsImperial = 'imperial' // Temperature in Fahrenheit

    const unitsMetricTemp = 'C'
    const unitsMetricWindSpeed = 'm/s'
    const unitsImperialTemp = 'F'
    const unitsImperialWindSpeed = 'mph'

    let selectedCity = ''

    const showWeather = async (cityID = cityDefault, metricID = unitsMetric) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityID}&units=${metricID}&appid=${apiKey}`)

            // check for response status
            if (response.status != 200) {
                if (response.status == 404) throw Error(`City not found. To make search more precise put the city's name, comma, 2-letter country code (ISO3166).`)
                else throw Error(`Oops, something went wrong! (${response.status}: ${response.statusText})`)
            }

            let data = await response.json()

            const cityFullName = `${data.name}, ${data.sys.country}`
            const cityLon = data.coord.lon
            const cityLat = data.coord.lat
            const unitTemp = (metricID == unitsMetric) ? unitsMetricTemp : (metricID == unitsImperial) ? unitsImperialTemp : ''
            const unitWindSpeed = (metricID == unitsMetric) ? unitsMetricWindSpeed : (metricID == unitsImperial) ? unitsImperialWindSpeed : ''

            fillPanelMain(data, unitTemp)

            const response2 = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly&units=${metricID}&appid=${apiKey}`)

            // check for response status
            if (response2.status != 200) throw Error(`${response2.status}: ${response2.statusText}`)

            let data2 = await response2.json()

            fillPanelDetails(cityFullName, data2, unitTemp, unitWindSpeed)
            fillPanelDaily(data2, unitTemp)
            fillPanelAlert(data2)

            // const response3 = await fetch(`https://tile.openweathermap.org/map/temp_new/3/-20/20.png?appid=${apiKey}`)
            // console.log(response3)

            // // check for response status
            // if (response3.status != 200) throw Error(`${response3.status}: ${response3.statusText}`)

            // let data3 = await response3.json()
            // console.log(data3)

            selectedCity = cityID
        }
        catch(err) {
            alert(err.message)
        }
    }

    const fillPanelMain = (data, unitTemp) => {
        const localDate = new Date(data.dt * 1000)
        const localDateOptions = {
            month: "short",
            day: "2-digit",
            hour: '2-digit',
            minute: '2-digit'
        }
        const imgSource = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

        // clear the container
        $('.main-column').html('')

        // create main content
        const contentMain = `<div class="column-container">
<div class="column-title">
<h2>${data.name}, ${data.sys.country}</h2>
<p class="date-time">${localDate.toLocaleString('en-us', localDateOptions)}</p>
</div>
<div class="column-content">
<div class="column-content-text">
<p class="temperature">${Math.round(data.main.temp)}&deg;${unitTemp}</p>
<p class="description">${data.weather[0].description}</p>
</div>
<div class="column-content-image">
<img src="${imgSource}" alt="${data.weather[0].description}" />
<p class="temp-min-max text-center">${Math.round(data.main.temp_min)} / ${Math.round(data.main.temp_max)}&deg;${unitTemp}</p>
</div>
</div>
</div>`

        // add content to the main container
        $('.main-column').html(contentMain)
    }

    const fillPanelDetails = (pCityName, data, unitTemp, unitWindSpeed) => {
        const localDate = new Date(data.daily[0].dt * 1000)
        const localDateOptions = {
            month: "short",
            day: "2-digit"
        }

        const sunriseDate = new Date(data.current.sunrise * 1000)
        const sunsetDate = new Date(data.current.sunset * 1000)
        const sunriseSunsetDateOptions = {
            hour: '2-digit',
            minute: '2-digit'
        }

        // clear the container
        $('.detail-column').html('')

        // create detail content
        const contentDetail = `<div class="column-container">
<div class="column-title">
<h2>Weather today in ${pCityName}</h2>
</div>
<div class="column-content">
<div class="column-content-text-period">
<div class="period-item text-center"><p class="fw-bold">Morning</p><p class="temperature">${Math.round(data.daily[0].temp.morn)}&deg;${unitTemp}</p><p class="feels-like">(feels like ${Math.round(data.daily[0].feels_like.morn)}&deg;${unitTemp})</p></div>
<div class="period-item text-center"><p class="fw-bold">Afternoon</p><p class="temperature">${Math.round(data.daily[0].temp.day)}&deg;${unitTemp}</p><p class="feels-like">(feels like ${Math.round(data.daily[0].feels_like.day)}&deg;${unitTemp})</p></div>
<div class="period-item text-center"><p class="fw-bold">Evening</p><p class="temperature">${Math.round(data.daily[0].temp.eve)}&deg;${unitTemp}</p><p class="feels-like">(feels like ${Math.round(data.daily[0].feels_like.eve)}&deg;${unitTemp})</p></div>
<div class="period-item text-center"><p class="fw-bold">Night</p><p class="temperature">${Math.round(data.daily[0].temp.night)}&deg;${unitTemp}</p><p class="feels-like">(feels like ${Math.round(data.daily[0].feels_like.night)}&deg;${unitTemp})</p></div>
</div>
<div class="column-content-text-detail">
<p class="detail-item"><span class="fw-bold">wind</span><span> ${data.current.wind_speed} ${unitWindSpeed}</span></p>
<p class="detail-item"><span class="fw-bold">pressure</span><span> ${data.current.pressure} hPa</span></p>
<p class="detail-item"><span class="fw-bold">humidity</span><span> ${data.current.humidity}%</span></p>
<p class="detail-item"><span class="fw-bold">uv</span><span> ${Math.round(data.current.uvi)}</span></p>
<p class="detail-item"><span class="fw-bold">sunrise</span><span> ${sunriseDate.toLocaleString('en-us', sunriseSunsetDateOptions)}</span></p>
<p class="detail-item"><span class="fw-bold">sunset</span><span> ${sunsetDate.toLocaleString('en-us', sunriseSunsetDateOptions)}</span></p>
</div>
</div>
</div>`

        // add content to the detail container
        $('.detail-column').html(contentDetail)
    }

    const fillPanelDaily = (data, unitTemp) => {
        // set date options
        const localDateOptions1 = {
            weekday: "short"
        }
        const localDateOptions2 = {
            day: "2-digit"
        }

        // initialize variable
        let dailyForecast = '<div class="column-content-text-forecast">'
        
        // get the first 5 items of the array
        for (let i = 0; i <= 4; i++) {
            const localDate = new Date(data.daily[i].dt * 1000)
            const imgSource = `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`

            dailyForecast += `<div class="forecast-item text-center">
<p class="fw-bold">${i != 0 ? localDate.toLocaleDateString('en-us', localDateOptions1) + ' ' + localDate.toLocaleDateString('en-us', localDateOptions2) : 'Today'}</p>
<p class=temperature>${Math.round(data.daily[i].temp.max)} / ${Math.round(data.daily[i].temp.min)}&deg;${unitTemp}</p>
<img src="${imgSource}" alt="${data.daily[i].weather[0].description}" />
<p class="description">${data.daily[i].weather[0].description}</p>
</div>`
        }

        dailyForecast += '</div>'

        // clear the container
        $('.daily-column').html('')

        // create main content
        const contentDaily = `<div class="column-container">
<div class="column-title">
<h2>Daily forecast</h2>
</div>
<div class="column-content">
${dailyForecast}
</div>
</div>`

        // add content to the main container
        $('.daily-column').html(contentDaily)
    }

    const fillPanelAlert = data => {
        console.log(data)
        // clear the container
        $('.alert-column').html('')

        // initialize variable
        let contentAlert = '<div class="column-container">'

        // verify if exists an alert
        if ('alerts' in data) {
            const startDate = new Date(data.alerts[0].start * 1000)
            const endDate = new Date(data.alerts[0].end * 1000)
            const startEndDateOptions = {
                month: "short",
                day: "2-digit",
                hour: '2-digit',
                minute: '2-digit'
            }

            // create main content
            contentAlert += `<div class="column-title">
<h2>${data.alerts[0].event}</h2>
</div>
<div class="column-content">
<div class="column-content-text">
<p><span class="fw-bold">Sender:</span> ${data.alerts[0].sender_name}</p>
<p><span class="fw-bold">Start date:</span> ${startDate.toLocaleString('en-us', startEndDateOptions)}</p>
<p><span class="fw-bold">End date:</span> ${endDate.toLocaleString('en-us', startEndDateOptions)}</p>
<br />
<p>${data.alerts[0].description}</p>
</div>
</div>
</div>`
        }
        else {
            // create main content
            contentAlert += `<div class="column-title">
<h2>Alerts</h2>
</div>
<div class="column-content">
<div class="column-content-text">
<p>There are no alerts for the region!</p>
</div>
</div>
</div>`
        }

        contentAlert += '</div>'

        // add content to the main container
        $('.alert-column').html(contentAlert)
    }

    showWeather()

    $('#txt-search').keypress(e => {
        if (e.which == 13) {
            e.preventDefault()
            $('#btn-search').click()
        }
    })

    $('#btn-search').click(e => {
        e.preventDefault()

        const cityID = $('#txt-search').val()

        if (cityID == '') alert('Please inform a valid city!')
        else {
            const metricID = $('#sel-metric').val()

            if (metricID == '0') {
                selectedCity = cityID

                $('#sel-metric').change()
            }
            else showWeather(cityID, metricID)
        }
    })

    $('#sel-metric').change(function() {
        if (selectedCity == '') alert('Please inform a valid city!')
        else {
            const metricID = $(this).val()

            if (metricID == '0') {
                $('#sel-metric').val(unitsMetric)
                $('#sel-metric').change()
            }
            else showWeather(selectedCity, metricID)
        }
    })

    $('#btn-reset').click(e => showWeather())
});