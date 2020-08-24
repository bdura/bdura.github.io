---
date: 2020-07-07
title: Playing the game of life
categories:
  - ai
  - rl
image:
  source: https://source.unsplash.com/W7L6KCaNfRU
  legend: Medical illustration of Clostridioides difficile bacteria
  reference: CDC
description: |
  Can we understand what independent agents learn to optimise in a purely evolutionary setting?
---

This project was inspired by Blaise Aguera's [invited talk at NeurIPS 2019](https://slideslive.com/38922302/social-intelligence).

What does an evolutionary strategy optimise?
The answer might seem obvious: it's just _survival of the fittest_. But consider the case where the fitness function is not explicitly defined... Think of Life itself: what objective are we or any living species implicitly optimising?

To give some intuition on what the answer might be, we will study a (hopefully) life-like model for a colony of bacteria, learning to survive in a harsh environment using a purely evolutionary approach. Depending on the action they take, the bacteria might die rapidly, killing off their genetic material, or on the contrary thrive and reproduce, passing their genome on to the next generation.

In the end, the "best performing" genome will take over the entire population. Something has been optimised, but what? To answer that question, we will use an indirect strategy.
<!-- Instead of equating genomes with behaviours, we will instead use the genetic material to define the objective itself. -->

<!-- Then, we try to understand what is actually being optimised by the evolution process. -->


## Playing the game

In our model, agents are single-cell bacteria that need energy to thrive, lest they die of exhaustion. They start out with an energy level of 1/2, die if they reach 0 and reproduce if they reach 1, passing on their genetic material to their offspring.

At each time step, using information from their local environment, each bacterium can choose to perform one of two basic actions:
* "Run", ie go straight;
* "Tumble", ie randomise its direction.

{% include figure.html source="https://docs.google.com/drawings/d/e/2PACX-1vQnPoOyX5pvzlugkIhhGi86Vr81HPJ-EGLYdOIvBw_fomYRp-iQZAFE3OENGdUhj4VU6EbZurJhFvxZ/pub?w=281&h=311" caption="E. coli's chemotaxis, a sequence of runs and tumbles"%}

A bacterium's genome is fully represented by a Q-table: given an observation, the Q-table tells the bacterium which of the two actions should lead to the better future. Throughout the agent's life, its genome is subject to random mutations, and some genetic material can be exchanged with other agents that are in close proximity.

At each time step, the bacteria lose some of their energy unless they are close to a food source that moves around the environment.

{% include multiple_figures.html base_url="/assets/images/rl/sourdough/" sources="00000.png|00003.png|00053.png|00270.png|00597.png" caption="Survival of the fittest..." subcaptions="The genome is chosen randomly at the beginning|The energy of bacteria far from the food source is quicly depleted...|...and the population collapses|The variability in the genome falls|The most efficient genome quickly takes over the entire population" %}

{% include ref_fig.html label=2 capitalise=true %} shows the state of the simulation at different generations. In the first iterations, the population collapses rapidly as most bacteria start very far from the food source. The Q-tables, shown on the top right corner, illustrate that as the population gets decimated, the genome becomes more uniform: only the bacteria equipped to seek out food survive.

After around 500 generations, the genome stabilises and the population skyrockets: the evolution process has selected a genome that fits "life" well.

Note that although we've used reinforcement learning concepts such as the _Q-table_, at no point did we perform RL. Rather, we let a purely evolutionary strategy roll out in an environment applying selective pressure on mutating agents.
<!-- We could add environmental pressure on the bacteria, for example by speeding up the movement of the food source. -->


## What are they optimising?

Contrary to other evolutionary strategies that define a _fitness_ function used to compare individuals within a generation to decide which part of the population survives (or reproduces itself), we've let the environment resolve an implicit objective.

Understanding what objective the colony is optimising as a whole is very much a reverse reinforcement learning problem: the evolution has provided us with a Q-table and we want to know the reward function the value function optimises.

Following Blaise Aguera's insight, we'll try to answer this question using a surrogate problem. Rather than equating the bacterium's genome with its Q-table, we will define it through a reward function that, unlike in the previous simulation, the agent will optimise for. In other words, each bacterium aims to solve an RL problem explicitly defined by its individual reward function.

This is a major shift in perspective. The environment will now apply selective pressure on the reward function itself, which will let us see what the fittest bacteria optimise for.

Recall the Q-learning algorithm:
{% equation %}
v(s, a) = R(s, a) + \gamma \max_{a'} v(s', a'),
{% endequation %}
where $s$, $a$ denote states and actions, $R$ is the reward function. $s'$ is the observed state when the agent chose action $a$ while in state $s$.


## About the name

Invented in 1970 by British mathematician John Horton Conway, the [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) aims to simulate the evolution of a colony of cells using very basic rules, leading to patterns of incredible complexity.

{% include figure.html source="https://upload.wikimedia.org/wikipedia/commons/e/e5/Gospers_glider_gun.gif" caption="A single Gosper's glider gun creating gliders (Wikipedia)"%}

{% include ref_fig.html label=3 capitalise=true %} provides an example of such complex pattern: it shows a "glider gun", a periodic structure shooting out _gliders_ –small units that translate themselves across the grid.
