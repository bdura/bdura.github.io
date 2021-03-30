function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const vertical = (rect.bottom < 0) ||
            (rect.top > (window.innerHeight || document.documentElement.clientHeight)),
          horizontal = (rect.right < 0) ||
            (rect.left > (window.innerWidth || document.documentElement.clientWidth));
    return (
        // rect.top >= 0 &&
        !vertical && !horizontal
    );
}


function contaminationAnimation(locale) {

  var margin = {top: 5, right: 0, bottom: 5, left: 0},
      width = 800,
      height = 400
      position = {x: 0, y: 0};

  var n = 200,
      radius = 5,
      speed = 1,
      day = 2200;

  var contagiousness = .5,
      period = 2,
      vaccination = 0,
      initial = 1;

  var status;
  var particles;
  var selection;

  var timeouts = [];

  var maxDistance2;

  var replay;

  function animation(canvas) {

    selection = canvas.append("svg");

    selection
      .attr("width", width)
      .attr("height", height);

    // Update the position
    selection
        .attr("x", position.x)
        .attr("y", position.y);

    maxDistance2 = 4 * radius ** 2;
    const nVaccinated = Math.round(n * vaccination);

    // Add the particles
    particles = new Array(n);
    for (let i = 0; i < n; ++i) {
      particles[i] = {
        x: 2 * radius + Math.random() * (width - 4 * radius),
        y: 2 * radius + Math.random() * (height - 4 * radius),
        a: Math.random() * 2 * Math.PI,
        c: (i < initial) ? "contagious" : (i >= initial + nVaccinated) ? "healthy" : "vaccinated",
      };
    }

    // Update the states
    status = {c: initial, v: nVaccinated, i: 0, h: n - initial - nVaccinated}

    selection.selectAll("circle")
        .data(particles)
        .join("circle")
        .attr("r", radius);

    selection.append("rect")
        .attr("class", "replay-screen")
        .attr("width", width)
        .attr("height", height)
        .on("click", replay);

    selection.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("font-weight", "bold")
        .attr("font-family", "sans-serif")
        .style("pointer-events", "none")
        .text((locale === "fr") ? "Relancer" : "Restart");

    // Add a timeout on patient zero
    timeouts.push(
      d3.timeout(function (e) {
        for (let i = 0; i < initial; ++i){
          particles[i].c = "immune";
        }
        status.c -= initial;
        status.i += initial;
      }, period * day)
    );

  }

  function d2(p, o){
    return (p.x - o.x) ** 2 + (o.y - p.y) ** 2;
  }

  function distance(p, o){
    return Math.sqrt(d2(p, on));
  }

  function reflect(a, vertical=false){
    if (vertical){
      return Math.PI - a;
    }
    else {
      return - a;
    }
  }

  function translate(p, a, s, inplace=false){
    let o = {
      x: p.x + s * Math.cos(a),
      y: p.y + s * Math.sin(a)
    };
    if (inplace) {
      p.x = o.x;
      p.y = o.y;
    } else {
      return o;
    }
  }

  animation.update = function() {
    for (let i = 0; i < n; ++i) {
      const p = particles[i];

      const vertical = p.x + radius >= width || p.x <= radius,
            horizontal = p.y + radius >= height || p.y <= radius;

      for (let j = i + 1; j < n; ++j) {
        const o = particles[j];

        if (d2(o, p) < maxDistance2) {

          const keep = d2(translate(o, o.a, speed), translate(p, p.a, speed)),
                swap = d2(translate(o, p.a, speed), translate(p, o.a, speed));

          if (keep < swap) {
            let a = p.a;
            p.a = o.a;
            o.a = a;
          }

          if (p.c === "contagious" && o.c === "healthy" && Math.random() < contagiousness){

            o.c = "contagious";
            status.h--;
            status.c++;

            timeouts.push(
              d3.timeout(function(e){
                o.c = "immune";
                status.c--;
                status.i++;
              }, day * period)
            );

          }
          else if (o.c === "contagious" && p.c === "healthy" && Math.random() < contagiousness){

            p.c = "contagious";
            status.h--;
            status.c++;

            timeouts.push(
              d3.timeout(function(e){
                p.c = "immune";
                status.c--;
                status.i++;
              }, day * period)
            );

          }

          break;
        }
      }

      // Reflection on the wall
      if (vertical || horizontal) {
        p.a = reflect(p.a, vertical);
      }

      translate(p, p.a, speed, true);
    }

    selection.selectAll("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("class", d => d.c);
  }

  function reset() {

    timeouts.forEach(item => {
      item.stop();
    });

    const nVaccinated = Math.round(n * vaccination);

    // Add the particles
    particles = new Array(n);
    for (let i = 0; i < n; ++i) {
      particles[i] = {
        x: 2 * radius + Math.random() * (width - 4 * radius),
        y: 2 * radius + Math.random() * (height - 4 * radius),
        a: Math.random() * 2 * Math.PI,
        c: (i < initial) ? "contagious" : (i >= initial + nVaccinated) ? "healthy" : "vaccinated",
      };
    }

    // Update the states
    status = {c: initial, v: nVaccinated, i: 0, h: n - initial - nVaccinated}

    selection.selectAll("circle")
        .data(particles)
        .join("circle")
        .attr("r", radius)

    // Add a timeout on patient zero
    timeouts = [
      d3.timeout(function (e) {
        for (let i = 0; i < initial; ++i){
          particles[i].c = "immune";
        }
        status.c -= initial;
        status.i += initial;
      }, period * day)
    ];
  }

  animation.reset = function() {
    reset();
  }

  animation.replay = function(r) {
    replay = r;
    return animation;
  }

  animation.status = function() {
    return status;
  };

  animation.position = function(_) {
    if (!arguments.length) return position;
    position = _;
    return animation;
  };

  animation.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return animation;
  };

  animation.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return animation;
  };

  animation.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return animation;
  };

  animation.n = function(_) {
    if (!arguments.length) return n;
    n = _;
    return animation;
  };

  animation.radius = function(_) {
    if (!arguments.length) return radius;
    radius = _;
    return animation;
  };

  animation.speed = function(_) {
    if (!arguments.length) return speed;
    speed = _;
    return animation;
  };

  animation.day = function(_) {
    if (!arguments.length) return day;
    day = _;
    return animation;
  };

  animation.contagiousness = function(_) {
    if (!arguments.length) return contagiousness;
    contagiousness = _;
    return animation;
  };

  animation.period = function(_) {
    if (!arguments.length) return period;
    period = _;
    return animation;
  };

  animation.vaccination = function(_) {
    if (!arguments.length) return vaccination;
    vaccination = _;
    return animation;
  };

  animation.initial = function(_) {
    if (!arguments.length) return initial;
    initial = _;
    return animation;
  };

  function collisions() {
    let dx = speed,
        dt = 1 / (day / 1000 * 60),
        w = width,
        h = height,
        r = radius;
    return 1 / dt * (1 - Math.pow(1 - 4 * r * dx / ((w - 2 * r) * (h - 2 * r)), n - 1));
  }

  function r0() {
    return collisions() * contagiousness * period;
  }

  animation.adapt2R0 = function() {
    let dt = 1 / (day / 1000 * 60),
        w = width,
        h = height,
        r = radius;

    speed = (1 - Math.pow(1 - dt, 1 / (n - 1))) / 4 / r * ((w - 2 * r) * (h - 2 * r));

    return animation;
  };

  return animation;
}


function evolutionChart(locale) {
  var margin = {top: 10, right: 0, bottom: 35, left: 35},
      width = 600,
      height = 200
      loc = {x: 0, y: 0};

  var x = d3.scaleLinear(),
      y = d3.scaleLinear();

  var xLegend, yLegend;

  var xLegend = "jours →";
      yLegend = "↑ part de la population non vaccinée";

  if (locale === "fr"){
    xLegend = "jours depuis la première infection →";
    yLegend = "↑ part de la population non vaccinée";
  } else {
    xLegend = "days since first infection →";
    yLegend = "↑ share of the unvaccinated population";
  }

  var selection;

  var classes = ["contagious", "healthy", "immune"],
      data = [[], [], []];

	var area = d3.area()
		.x(d => x(d.t))
		.y0(d => y(d.y0))
		.y1(d => y(d.y1));

  var xAxis, yAxis;

  function stacker(status, day) {

    const c = status.c,
          h = status.h,
          i = status.i;
    const t = c + h + i;

    data[0].push({t: day, y0: 0, y1: c / t});
    data[1].push({t: day, y0: c / t, y1: c / t + h / t});
    data[2].push({t: day, y0: c / t + h / t, y1: 1});
  }

  function chart(canvas) {

    selection = canvas.append("svg")

    // Update the dimensions
    selection
        .attr("width", width)
        .attr("height", height);

    // Update the position
    selection
        .attr("x", loc.x)
        .attr("y", loc.y);

    // Update the scales
    x.range([margin.left, width - margin.right]).domain([0, 0]);
    y.domain([0, 1]).range([height - margin.bottom, margin.top]);

  	xAxis = g => g
  		.attr("transform", `translate(0, ${height - margin.bottom})`)
  		.call(d3.axisBottom(x).ticks(width / 80));

  	yAxis = g => g
  		.attr("transform", `translate(${margin.left},0)`)
  		.call(d3.axisLeft(y).ticks(5, "%"))
  		.call(g => g.select(".domain").remove());

    selection.selectAll("g")
        .data(["area", "xAxis", "yAxis"])
        .join("g")
        .attr("class", d => d);

    selection.select("g.area")
        .selectAll("path")
    		.data(data)
    		.join("path")
    			.attr("class", (d, i) => classes[i])
    			.attr("d", area)

    // Add x-axis
    selection.select("g.xAxis")
        .call(xAxis)
        .append("text")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("text-anchor", "end")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("x", width - margin.right)
          .attr("dx", "-0.75em")
          .attr("y", 0)
          .attr("dy", "-0.75em")
          .attr("class", "legend")
          .text(xLegend);


    selection.select("g.yAxis").call(yAxis)
        .append("text")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("x", 0)
          .attr("y", margin.top)
          .attr("dx", ".3em")
          .attr("dy", "1.3em")
          .attr("class", "legend")
          .text(yLegend);

  }

  chart.update = function(status, day) {
    stacker(status, day);

    x.domain([0, day]);

    selection.select("g.area")
        .selectAll("path")
        // .data(data)
        // .join("path")
          .attr("class", (d, i) => classes[i])
          .attr("d", area)

    selection
        .select("g.xAxis")
          .call(xAxis);

  }

  chart.reset = function(status) {
    data = [[], [], []];

    selection.select("g.area")
        .selectAll("path")
        .data(data);

  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.position = function(_) {
    if (!arguments.length) return loc;
    loc = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}


function barChart(locale) {

  var margin = {top: 10, right: 10, bottom: 35, left: 45},
      width = 200,
      height = 200,
      position = {x: 0, y: 0};

  var vaccination = false,
      status,
      total,
      selection;

  var x = d3.scaleBand(),
      y = d3.scaleLinear();

  var yLegend, xLegend;

  if (locale === "fr"){
    yLegend = "part de la population →";
    xLegend = [
      {name: "Sains", class: "healthy"},
      {name: "Contagieux", class: "contagious"},
      {name: "Guéris", class: "immune"},
      {name: "Vaccinés", class: "vaccinated"}
    ];
  } else {
    yLegend = "share of the population →";
    xLegend = [
      {name: "Healthy", class: "healthy"},
      {name: "Contagious", class: "contagious"},
      {name: "Cured", class: "immune"},
      {name: "Vaccinated", class: "vaccinated"}
    ];
  }

  function chart(canvas) {

    selection = canvas.append("svg");

    // Update the outer dimensions.
    selection
        .attr("width", width)
        .attr("height", height);

    // Update the position
    selection
        .attr("x", position.x)
        .attr("y", position.y);
  }

  chart.reset = function(datum) {

    selection.selectAll("*").remove();

    vaccination = datum.v > 0;

    status = new Array(vaccination ? 4 : 3);
    status[0] = datum.h;
    status[1] = datum.c;
    status[2] = datum.i;
    if (vaccination) status[3] = datum.v;

    total = d3.sum(status);

    // Update the x-scale.
    x
        .domain(d3.range(status.length))
        .range([margin.left, width - margin.right])
        .padding(0.1)

    // Update the y-scale.
    y
        .domain([0, d3.max([1 - datum.v / total, datum.v / total])]).nice()
        .range([height - margin.bottom, margin.top])

    format = y.tickFormat(20, "%")

    // Create the axis
    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(i => xLegend[i].name).tickSizeOuter(0))
        .call(g => g.selectAll("text")
              .style("text-anchor", "middle")
              .attr("font-weight", "bold")
              .attr("y", (d, i) => `${3 - 1.2 * (i % 2)}em`)
              .attr("x", 0)
              .attr("dy", 0));

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5, format))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .attr("font-weight", "bold")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dx", -margin.top)
            .attr("dy", -margin.left + 10)
            .attr("transform", "rotate(-90)")
            .text(yLegend));

    selection.selectAll("g")
        .data(["bars", "xAxis", "yAxis", "text"])
        .join("g")
          .attr("class", d => d);

    selection.select("g.bars")
        .selectAll("rect")
        .data(status)
        .join("rect")
          .attr("x", (d, i) => x(i))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d / total))
          .attr("height", d => y(0) - y(d / total))
          .attr("class", (d, i) => xLegend[i].class);

    selection.select("g.text")
        .selectAll("text")
        .data(status)
        .join("text")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("font-family", "sans-serif")
          .attr("font-size", 14)
          .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
          .attr("text-anchor", "middle")
          .attr("class", (d, i) => xLegend[i].class)
          .attr("y", d => y(d / total))
          .attr("dy", 17)
          .attr("style", "fill: white !important;")
          .text(d => d)
          .call(text => text.filter(d => y(d / total) > 40) // short bars
            .attr("dy", -5)
            .attr("style", ""));

    selection.select("g.xAxis").call(xAxis);
    selection.select("g.yAxis").call(yAxis);

    selection.selectAll("g.xAxis g.tick line")
        .attr("y2", i => 6 + 12 * ((i + 1) % 2));
  }

  chart.update = function(datum) {

    if (
      status[0] === datum.h
      && status[1] === datum.c
      && status[2] === datum.i
    ) {
      return;
    }

    status[0] = datum.h;
    status[1] = datum.c;
    status[2] = datum.i;
    if (vaccination) status[3] = datum.v;

    selection.select("g.bars")
        .selectAll("rect")
          .data(status)
          .transition()
          .attr("y", d => y(d / total))
          .attr("height", d => y(0) - y(d / total))

    texts = selection.select("g.text")
      .selectAll("text")
        .data(status)

    texts
        .attr("dy", 17)
        .attr("style", "fill: white")
        .call(text => text.filter(d => y(d / total) > 30) // short bars
          .attr("dy", -5)
          .attr("style", ""));

    texts
        .transition()
        .attr("y", d => y(d / total))
        .text(d => d);
  }

  chart.status = function(){
    return status;
  }

  chart.position = function(_) {
    if (!arguments.length) return position;
    position = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.position = function(_) {
    if (!arguments.length) return position;
    position = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.vaccines = function(_) {
    if (!arguments.length) return useVaccines;
    useVaccines = _;
    return chart;
  };

  chart.total = function(_) {
    if (!arguments.length) return total;
    total = _;
    return chart;
  };

  chart.offset = function(_) {
    if (!arguments.length) return offset;
    offset = _;
    return chart;
  };

  return chart;
}


function slider() {
  var width = 200,
      position = {x: 0, y: 0};

  var min = 0,
      max = 1,
      value,
      legend,
      step = .01,
      ticks = 3,
      displayValue = true,
      format;

  var on = function(val) {};
  var throttle = 100;

  var selection;

  var ticksSqueezer = g => g.selectAll("text").attr("dy", 0);

  function chart(canvas) {
    selection = canvas.append("svg");

    // Update the outer dimensions.
    selection
        .attr("width", width)
        .attr("height", 55);

    // Update the position
    selection
        .attr("x", position.x)
        .attr("y", position.y);

    var s = d3.sliderHorizontal()
      .min(min)
      .max(max)
      .value(value)
      .step(step)
      .ticks(ticks)
      .tickFormat(format)
      .width(width - 30)
      .displayValue(displayValue)
      .on('onchange', _.throttle(on, throttle));

    selection.append('g')
        .attr("transform", "translate(15, 25)")
        .call(s)
        .call(ticksSqueezer);

    selection.append("text")
            .attr("class", "legend")
            .attr("font-size", 12)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", width / 2)
            .attr("y", 12)
            .text(legend)
  }

  chart.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return chart;
  };

  chart.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return chart;
  };

  chart.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    return chart;
  };

  chart.step = function(_) {
    if (!arguments.length) return step;
    step = _;
    return chart;
  };

  chart.position = function(_) {
    if (!arguments.length) return position;
    position = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.legend = function(_) {
    if (!arguments.length) return legend;
    legend = _;
    return chart;
  };

  chart.on = function(_) {
    if (!arguments.length) return on;
    on = _;
    return chart;
  };

  chart.format = function(_) {
    if (!arguments.length) return format;
    format = _;
    return chart;
  };

  return chart;
}


function r0Chart() {
  var width = 100,
      height = 55,
      position = {x: 0, y: 0},
      margin = {top: 10, right: 10, bottom: 10, left: 10, middle: 10};

  var format = d3.format(".2f");

  var selection;

  function chart(canvas) {
    selection = canvas.append("svg");

    // Update the outer dimensions.
    selection
        .attr("width", width)
        .attr("height", height);

    // Update the position
    selection
        .attr("x", position.x)
        .attr("y", position.y);
  }

  chart.update = function(r0, r0e) {
      selection.select("g").remove();

      let g = selection.append('g')
        .attr('transform', `scale(.8) translate(${margin.left} ${margin.top})`)
        .append(() => MathJax.tex2svg(String.raw`\begin{align} R_0 & = ${format(r0)} \\ R_0^e &= ${format(r0e)} \end{align}`).childNodes[0]);
  };

  chart.position = function(_) {
    if (!arguments.length) return position;
    position = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  return chart;
}


function controlsChart(locale) {
    var width = 800,
        height = 65,
        margin = {top: 10, right: 10, bottom: 10, left: 10, middle: 10};

    var position = {x: 0, y: 0};

    var vaccination = 0.,
        contagiousness = 1.,
        period = 10;

    var contamination = {n: 200, radius: 5, width: 800, height: 600, day: 2200, speed: 1};

    var legend;

    if (locale === "fr"){
      legend = {
        contagiousness: "taux de contamination",
        period: "période de contamination",
        vaccination: "taux de vaccination"
      };
    } else {
      legend = {
        contagiousness: "contamination rate",
        period: "contamination period",
        vaccination: "vaccination rate"
      };
    }

    var selection, text;
    var simulation, replay;

    var modifyText = g => g.selectAll("text").attr("dy", 0);

    function chart(canvas) {

      selection = canvas.append("svg");

      // Update the outer dimensions.
      selection
          .attr("width", width)
          .attr("height", height);

      // Update the position
      selection
          .attr("x", position.x)
          .attr("y", position.y);

      let usableWidth = width - margin.left - margin.right - 150;

      r0c = r0Chart()
          .width(150)
          .position({x: width - margin.right - 130, y: margin.top});

      var periodSlider = slider()
          .legend(legend.period)
          .min(0)
          .max(20)
          .value(period)
          .step(1)
          .width(usableWidth / 3 - margin.middle * 2)
          .position({x: margin.left + 0 * (usableWidth / 3 + margin.middle), y: margin.top})
          .on(function(val) {
            period = val;
            let r = r0();
            r0c.update(r, r * (1 - vaccination));
            updateSim();
          });

      var contagiousnessSlider = slider()
          .legend(legend.contagiousness)
          .min(0)
          .max(1)
          .value(contagiousness)
          .step(.01)
          .format(d3.format(".0%"))
          .width(usableWidth / 3 - margin.middle * 2)
          .position({x: margin.left + 1 * (usableWidth / 3 + margin.middle), y: margin.top})
          .on(function(val) {
            contagiousness = val;
            let r = r0();
            r0c.update(r, r * (1 - vaccination));
            updateSim();
          });

      var vaccinationSlider = slider()
          .legend(legend.vaccination)
          .min(0)
          .max(1)
          .value(vaccination)
          .step(.01)
          .format(d3.format(".0%"))
          .width(usableWidth / 3 - margin.middle * 2)
          .position({x: margin.left + 2 * (usableWidth / 3 + margin.middle), y: margin.top})
          .on(function(val) {
            vaccination = val;
            let r = r0();
            r0c.update(r, r * (1 - vaccination));
            updateSim();
          });

      periodSlider(selection);
      contagiousnessSlider(selection);
      vaccinationSlider(selection);
      r0c(selection);

      let r = r0();
      r0c.update(r, r * (1 - vaccination))

    }

  function collisions() {
    let dx = contamination.speed,
        dt = 1 / (contamination.day / 1000 * 60),
        w = contamination.width,
        h = contamination.height,
        n = contamination.n,
        r = contamination.radius;
    return 1 / dt * (1 - Math.pow(1 - 4 * r * dx / ((w - 2 * r) * (h - 2 * r)), contamination.n - 1));
  }

  function r0() {
    return collisions() * contagiousness * period;
  }

  function updateSim(){
    simulation.contagiousness(contagiousness);
    simulation.vaccination(vaccination);
    simulation.period(period);
  }

  chart.simulation = function(_) {
    if (!arguments.length) return simulation;
    simulation = _;
    return chart;
  };

  chart.replay = function(_) {
    if (!arguments.length) return replay;
    replay = _;
    return chart;
  };

  chart.position = function(_) {
    if (!arguments.length) return position;
    position = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.contagiousness = function(_) {
    if (!arguments.length) return contagiousness;
    contagiousness = _;
    return chart;
  };

  chart.period = function(_) {
    if (!arguments.length) return period;
    period = _;
    return chart;
  };

  chart.vaccination = function(_) {
    if (!arguments.length) return vaccination;
    vaccination = _;
    return chart;
  };

  return chart;
}


function contaminationChart(locale){

  var width = 800,
      height = 600,
      margin = {top: 10, right: 10, bottom: 10, left: 10};

  var evo = true,
      bar = true,
      ctrl = true;

  var n = 200,
      radius = 5,
      speed = 1,
      day = 2200;

  var contagiousness = .5,
      period = 2,
      vaccination = 0,
      initial = 1;

  var animation, bars, controls, evolution;
  var timer, run;

  function chart(selection){

    const svg = selection.append("svg")

    svg.attr('width', width)
       .attr('height', height)

    animation = contaminationAnimation(locale)
        .n(n)
        .radius(radius)
        .speed(speed)
        .day(day)
        .contagiousness(contagiousness)
  			.period(period)
  			.vaccination(vaccination)
        .initial(initial)
        .adapt2R0()
        .replay(replay);

    let y = 0;

    if (ctrl) {
      controls = controlsChart(locale)
          .simulation(animation)
          .width(width)
          .replay(replay)
          .vaccination(vaccination)
          .contagiousness(contagiousness)
          .period(period);
      controls(svg);

      height -= 65;
      y = 65;

      animation.position({x: 0, y: y});
    }

    if (evo && bar) {
      animation
          .width(width)
          .height(.7 * height);

      evolution = evolutionChart(locale)
          .width(.75 * width)
          .height(.3 * height)
          .position({x: .25 * width, y: y + .7 * height});

      bars = barChart(locale)
          .width(.25 * width)
          .height(.3 * height)
          .position({x: 0, y: y + .7 * height});

      animation(svg);
    	bars(svg);
    	evolution(svg);

    	evolution.update(animation.status(), 0);
    	bars.reset(animation.status());

    	run = function(e) {

    		animation.update();
    		bars.update(animation.status());

    		if (animation.status().c > 0) {
    			evolution.update(animation.status(), e / animation.day());
    		}
    	}
    } else if (evo) {
      animation
          .width(width)
          .height(.7 * height);

      evolution = evolutionChart(locale)
          .width(width)
          .height(.3 * height)
          .position({x: 0, y: y + .7 * height});

      animation(svg);
    	evolution(svg);

    	evolution.update(animation.status(), 0);

    	run = function(e) {
    		animation.update();

    		if (animation.status().c > 0) {
    			evolution.update(animation.status(), e / animation.day());
    		}
    	}
    } else if (bar) {
      animation
          .width(.75 * width)
          .height(height);

      bars = barChart(locale)
          .width(.25 * width)
          .height(height)
          .position({x: .75 * width, y: y});

      animation(svg);
    	bars(svg);

    	bars.reset(animation.status());

    	run = function(e) {
    		animation.update();
    		bars.update(animation.status());
    	}
    } else {
      animation
          .width(width)
          .height(height);

      animation(svg);

    	run = function(e) {
    		animation.update();
    	}
    }

    runIfInViewport = function(e) {
      if (isInViewport(selection.node())) {
        run(e);
      }
    }

  	timer = d3.timer(runIfInViewport);
  }

  function replay() {
    timer.stop();
    animation.reset();

    if (evo) {
      evolution.reset();
      evolution.update(animation.status(), 0);
    }

    if (bar) {
      bars.reset(animation.status());
    }

    timer.restart(runIfInViewport);
  }

  chart.restart = function() {
    replay();
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.n = function(_) {
    if (!arguments.length) return n;
    n = _;
    return chart;
  };

  chart.radius = function(_) {
    if (!arguments.length) return radius;
    radius = _;
    return chart;
  };

  chart.speed = function(_) {
    if (!arguments.length) return speed;
    speed = _;
    return chart;
  };

  chart.day = function(_) {
    if (!arguments.length) return day;
    day = _;
    return chart;
  };

  chart.contagiousness = function(_) {
    if (!arguments.length) return contagiousness;
    contagiousness = _;
    return chart;
  };

  chart.period = function(_) {
    if (!arguments.length) return period;
    period = _;
    return chart;
  };

  chart.vaccination = function(_) {
    if (!arguments.length) return vaccination;
    vaccination = _;
    return chart;
  };

  chart.bars = function(_) {
    if (!arguments.length) return bar;
    bar = _;
    return chart;
  };

  chart.evolution = function(_) {
    if (!arguments.length) return evo;
    evo = _;
    return chart;
  };

  chart.controls = function(_) {
    if (!arguments.length) return ctrl;
    ctrl = _;
    return chart;
  };

  chart.initial = function(_) {
    if (!arguments.length) return initial;
    initial = _;
    return chart;
  };

  chart.reset = function() {
    animation.reset();
  };

  // chart.adapt2R0 = function() {
  //   animation.adapt2R0();
  // }

  return chart;

}
