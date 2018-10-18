FileName = "no file selected";
inputFields = [];
Labels = [];
Case = [];

function loadFile(file) {
	FileName = file.name;
	fileLoaded(file.data);
}

function fileLoaded(data) {
	Case = [];
	data = data.split(/[\n\r]+/);
	testCases = Number(data.shift());
	idx = 0;
	for (i = 0; i < testCases; i++) {
		Case.push([]);
		itemCount = Number(data[idx]);
		Case[i].push(Number(data[idx + 1]));

		for (j = idx + 2; j < idx + itemCount + 2; j++) {
			item = data[j].split(" ");
			Case[i].push(Number(item[0]));
			Case[i].push(Number(item[1]));
		}
		idx += itemCount + 2;
	}
	selectionChanged();
}

function setup() {
	createCanvas(windowWidth, windowHeight);


	fill(255, 255, 255);

	plot = new GPlot(this);
	plot.setPos(0, 0);
	plot.setDim(windowWidth - 100, windowHeight / 2);
	plot.setTitleText("Knapsack w/ GA");
	plot.getXAxis().setAxisLabelText("Generation");
	plot.getYAxis().setAxisLabelText("Fitness");
	plot.setPointColor(color(0, 0, 0, 255));

	bestVal = createP("");
	bestVal.position(windowWidth / 2 - 100, windowHeight / 2 + 150);
	bestVal.style('color', '#0cff00');
	bestVal.style('font-size', "25px");
	BestC = createP("");
	BestC.position(windowWidth / 2 - 100, windowHeight / 2 + 190);
	BestC.style('color', '#0cff00');
	BestC.style('font-size', "20px");

	testSelect = createSelect();
	testSelect.position(20, windowHeight / 2 + 180);
	StartBtn = createButton("Start");
	StartBtn.position(65, windowHeight / 2 + 180);
	StartBtn.mousePressed(StartPoint);
	inputFile = createFileInput(loadFile);
	inputFile.position(20, windowHeight / 2 + 150);
	inputFile.style('color', '#ffffff');
	getLabel("Setting:", 190, 32);
	getLabel("Generations", 265);
	getLabel("Population", 315);
	getLabel("Crossover Probability", 365);
	getLabel("Mutation Probability", 415);
	getInput("Generations", 300);
	getInput("Population", 350);
	getInput("Crossover Probability", 400);
	getInput("Mutation Probability", 450);

}

function selectionChanged() {
	testSelect.remove();
	testSelect = createSelect();
	testSelect.position(20, windowHeight / 2 + 180);
	cases = Case.length;
	for (i = 0; i < cases; i++) {
		testSelect.option(i + 1);
	}
}


function getInput(inputName, offset) {
	Input = createInput(inputName);
	Input.position(20, windowHeight / 2 + offset);
	Input.value('');
	inputFields.push(Input);
}

function getLabel(LabelName, offset, fontSize = 14) {
	Label = createP(LabelName);
	Label.position(20, windowHeight / 2 + offset);
	Label.style('color', '#ffffff');
	Label.style('font-size', fontSize + 'px');
}

function draw() {
	background(0, 0, 0);

	plot.defaultDraw();
}

var timer;

function StartPoint() {
	if (Case.length == 0)
		return
	CaseNum = testSelect.value() - 1;
	Generations = Number(inputFields[0].value());
	Population = inputFields[1].value();
	CrossoverProb = Number(inputFields[2].value());
	MutationProb = Number(inputFields[3].value());
	population = [];
	generation = 0;
	itemsLength = (Case[CaseNum].length - 1) / 2;

	BestFitnessEver = -1;
	BestChromosome = [];
	GenerateInit(Population, itemsLength);
	clearInterval(timer);
	timer = setInterval(GeneticAlgorithm, 100);
}

function Fitness(chromosome) {
	totalWeight = 0;
	fitness = 0;
	for (k = 0; k < chromosome.length; k++) {
		if (chromosome[k]) {
			totalWeight += Case[CaseNum][1 + (2 * k)];
			fitness += Case[CaseNum][2 + (2 * k)];
		}
	}
	if (Case[CaseNum][0] < totalWeight) {
		fitness = 0;
	}
	return fitness;
}

function BestFitness() {
	bestFitness = -1;
	for (m = 0; m < population.length; m++) {
		chromoFitness = Fitness(population[m]);
		bestFitness = (bestFitness < chromoFitness) ? chromoFitness : bestFitness;
		if (BestFitnessEver < bestFitness) {
			BestFitnessEver = bestFitness;
			BestChromosome = population[m];
		}
	}
	return bestFitness;
}


function GenerateInit(popSize, ChromoLength) {
	plot.setPoints([]);
	for (i = 0; i < popSize; i++) {
		population.push([]);
		for (j = 0; j < ChromoLength; j++) {
			population[i].push(Math.round(Math.random()));
		}
	}
}

function nextGeneration() {
	children = [];
	for (i = 0; i < Math.floor((population.length + 1) / 2); i++) {
		Parent1 = selectParent();
		Parent2 = selectParent();
		crossOver(Parent1, Parent2);
	}
	children = children.slice(0, population.length);
	mutateChildren();
	population = children;
}

function selectParent() {
	lowerEnd = 0;
	cumFitness = [];
	for (m = 0; m < population.length; m++) {
		cumFitness.push(Fitness(population[m]) + lowerEnd);
		lowerEnd = cumFitness[m];
	}
	r = Math.random() * cumFitness[population.length - 1];
	for (m = 0; m < cumFitness.length; m++) {
		if (r <= cumFitness[m]) {
			return population[m];
		}
	}
}

function crossOver(P1, P2) {
	r = Math.random();
	if (r > CrossoverProb) {
		children.push(P1, P2);
		return;
	}
	intersection = 1 + Math.floor(Math.random() * (P1.length - 1));
	Child1 = P1.slice(0, intersection).concat(P2.slice(intersection, P2.length));
	Child2 = P2.slice(0, intersection).concat(P1.slice(intersection, P1.length));
	children.push(Child1, Child2);
}

function mutateChildren() {
	for (i = 0; i < children.length; i++) {
		for (j = 0; j < children[i].length; j++) {
			r = Math.random();
			if (r <= MutationProb) {
				children[i][j] = 1 - children[i][j];
			}
		}
	}
}

function ItemDisplay(chromosome) {
	items = [];
	for (l = 0; l < chromosome.length; l++) {
		if (chromosome[l]) {
			items.push(l + 1);
		}
	}
	return '[' + items.join(',') + ']';
}

function GeneticAlgorithm() {
	if (generation > Generations) {
		clearInterval(timer);
	}
	best = BestFitness();
	bestVal.html("Best Value : " + BestFitnessEver);
	BestC.html("Items Taken : " + ItemDisplay(BestChromosome));
	plot.addPoint(new GPoint(generation, best));
	nextGeneration();
	generation++;
}