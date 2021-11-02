# Some notes on using the KoboToA11y transformer

## Codeflow
When importing this ts module, a number of useful things are exported, namely:

### type KoboResult
A type that should match the output from a Kobo survey json response row.
As the content of the survey determines the format of the result, this needs to be changed to match the survey being transformed

### function transformKoboToA11y
The main function that takes a KoboResult and returns an a11yjson object. It has a mapping to generate each property on the returned object. It generates the values using helper functions and in-line logic.

It then uses a customized setter with lodash to set each property of the result object.

The rest of the function has a bunch of custom logic related to use cases I don't know about. This is probably where I'll have to write a bunch of custom logic to generate the right values from multiple different question answers for example.

### Wheelmap logic
Various bits and pieces are included in this transformer to generate/validate wheelmap data. This might be useful in the future when we want to create separate data for wheelmap usage.

One of the imports relies on rules from the WheelmapA11yRules which I have included by hand. Might take them out late if we don't use them. This file also relied on RatingRules which I included but that relied on ../Units.ts which wasn't in the original repo. In the end I took out the code relying on Wheelmap rules.

This does mean that 'properties.accessibility.entrances.0.stairs.0.stepHeight' cannot be calculated properly because it relies on the imported 'flatStepHeight' function.

The same goes for 'properties.accessibility.restrooms.0.washBasin.spaceBelow' which relies on 'wheelChairWashBasin'. I've commented out these properties for now.

## Questions
Why are the helper functions declared as variables?

## Alterations

### Fixing TypeScript errors
Typescript threw an error because a piece of code didn't map all possible values of a certain type: undefined was missing from YesNoPartiallyResult. I've altered the coee a bit but I'm not sure if having a value of undefined here would be semantically acceptable

```ts
'properties.accessibility.accessibleWith.wheelchair': {
  true: true,
  false: false,
  partially: false,
  'undefined': undefined
}[data['is_wheelchair_accessible']],
```

Another error was generated because the wheelmap rules file wasn't found. I added it manually for now.

### Changing KoboResult
I'm in the process of changing the KoboResult to match the survey we use